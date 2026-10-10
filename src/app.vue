<template>
	<img v-if="QRCodeString" id="qrcode" :title="is_visible_controls ? 'Hide Menu' : 'Show Menu'" :src="QRSvgBase64" @click="toggleHideControls">
	<div :class="['controls', { 'hidden': !is_visible_controls }]">
		<ul>
			<li>
				<div class="mode-selector">
					<div class="radio-item">
						<input type="radio" id="text-cb" v-model="settings.mode" value="text">
						<label for="text-cb" class="label-right">Text</label>
					</div>
					<div class="radio-item">
						<input type="radio" id="wifi-cb" v-model="settings.mode" value="wifi">
						<label for="wifi-cb" class="label-right">Wi-Fi</label>
					</div>
					<div class="radio-item">
						<input type="radio" id="otpauth-cb" v-model="settings.mode" value="otpauth">
						<label for="otpauth-cb" class="label-right">OTPAuth</label>
					</div>
				</div>
			</li>
			<li v-if="settings.mode === 'text'">
				<input type="text" class="input-field" placeholder="Enter Text" ref="textInputRef" v-model="settings.text">
			</li>
			<li v-if="settings.mode === 'wifi'">
				<div class="input-wrapper">
					<input type="text" class="input-field" placeholder="Enter Wi-Fi Name" ref="wifiSSIDRef" v-model="settings.wifi.ssid">
				</div>
				<div class="input-wrapper">
					<input type="text" class="input-field" placeholder="Enter Password" ref="wifiPasswordRef" v-model="settings.wifi.password">
				</div>
				<div class="input-wrapper">
					<input type="checkbox" id="wifi-hidden" v-model="settings.wifi.hidden">
					<label for="wifi-hidden" class="checkbox-label">Hidden Network</label>
				</div>
			</li>
			<li v-if="settings.mode === 'otpauth'">
				<div class="input-wrapper">
					<input type="text" class="input-field" placeholder="Enter App Name" ref="otpauthNameRef" v-model="settings.otpauth.name">
				</div>
				<div class="input-wrapper">
					<input type="text" class="input-field" placeholder="Enter Login" ref="otpauthLoginRef" v-model="settings.otpauth.login">
				</div>
				<div class="input-wrapper">
					<input type="text" class="input-field" placeholder="Enter Secret Code" ref="otpauthSecretRef" v-model="settings.otpauth.secret">
				</div>
			</li>
			<!--<li>-->
			<!--	<code>-->
			<!--		{{ JSON.stringify(settings, true, 3) }};-->
			<!--		{{ QRCodeString }}-->
			<!--	</code>-->
			<!--</li>-->
		</ul>
	</div>
</template>
<script setup>
	import QRCode from 'qrcode';
	import { onMounted, ref, reactive, computed, nextTick, watch } from 'vue';
	
	const saved_settings = JSON.parse(localStorage.getItem('tpkn_me_QR_settings') || '{}');
	const settings = reactive({
		text: saved_settings.text ?? '',
		mode: saved_settings.mode ?? 'text',
		wifi: {
			ssid: saved_settings.wifi?.ssid ?? '',
			password: saved_settings.wifi?.password ?? '',
			hidden: saved_settings.wifi?.hidden ?? false
		},
		otpauth: {
			name: saved_settings.otpauth?.name ?? '',
			login: saved_settings.otpauth?.login ?? '',
			secret: saved_settings.otpauth?.secret ?? ''
		}
	});
	
	// Text
	const textInputRef = ref(null);
	// Wi-Fi
	const wifiPasswordRef = ref(null);
	const wifiSSIDRef = ref(null);
	// OTPAuth
	const otpauthNameRef = ref(null);
	const otpauthLoginRef = ref(null);
	const otpauthSecretRef = ref(null);
	// Escape some symbols in credentials
	const wifiSSIDEscaped = computed(() => settings.wifi.ssid.replace(/[\\;:,"]/g, i => '\\' + i));
	const wifiPasswordEscaped = computed(() => settings.wifi.password.replace(/[\\;:,"]/g, i => '\\' + i));
	const otpauthNameEscaped = computed(() => settings.otpauth.name.replace(/[ @:/?&=#]/g, c => ({' ':'%20','@':'%40',':':'%3A','/':'%2F','?':'%3F','&':'%26','=':'%3D','#':'%23'})[c]));
	
	const QRSvgBase64 = ref('');
	const QRCodeString = computed(() => {
		switch (settings.mode) {
			case 'text':
				return settings.text;
			case 'wifi':
				return `WIFI:T:WPA;S:${wifiSSIDEscaped.value};P:${wifiPasswordEscaped.value};H:${settings.wifi.hidden};;`;
			case 'otpauth':
				return `otpauth://totp/${otpauthNameEscaped.value}:${settings.otpauth.login}?secret=${settings.otpauth.secret}&issuer=${otpauthNameEscaped.value}&algorithm=SHA1`;
		}
	});
	
	function redrawQRImage() {
		try {
			QRCode.toString(QRCodeString.value, {
				type: 'svg',
				margin: 2,
				rendererOpts: { quality: 1 },
				color: { dark: '#ffffff', light: '#000000' }
			}, (err, svgString) => {
				// if (err) throw new Error(err.message);
				if (err) return;
				const base64 = btoa(String.fromCharCode(...new TextEncoder().encode(svgString)));
				QRSvgBase64.value = `data:image/svg+xml;base64,${base64}`;
			});
		} catch (error) {
			console.error('Failed while creating QR-code:', error);
		}
	}
	
	// Focus
	async function focusInputField(current) {
		await nextTick();
		switch (current) {
			case 'text':
				textInputRef.value?.focus();
				break;
			case 'wifi':
				wifiSSIDRef.value?.focus();
				break;
			case 'otpauth':
				otpauthNameRef.value?.focus();
				break;
		}
	}
	
	// Update QR if final string changed
	watch(QRCodeString, redrawQRImage);
	// Focus first field on section switch
	watch(() => settings.mode, focusInputField);
	// Save settings to localStorage if changed
	watch(settings, (current) => {
		localStorage.setItem('tpkn_me_QR_settings', JSON.stringify(current));
	}, { deep: true });
	
	onMounted(redrawQRImage);
	
	/**
	 * ...
	 */
	const is_visible_controls = ref(true);
	
	function toggleHideControls() {
		is_visible_controls.value = !is_visible_controls.value;
		nextTick(() => textInputRef.value?.focus());
	}
</script>
<style lang="scss">
	@use '@scss/main.scss';
</style>
