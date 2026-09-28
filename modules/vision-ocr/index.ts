/**
 * Text recognition on the device (iOS: Apple's Vision framework, see ios/VisionOcrModule.swift).
 * On the web and in tests there is no native module, so `ocrAvailable` is false and the screen
 * offers typing only. Nothing here touches the network.
 */
import { requireOptionalNativeModule } from 'expo-modules-core';

interface VisionOcr {
  recognize(uri: string): Promise<string>;
}

const native = requireOptionalNativeModule<VisionOcr>('VisionOcr');

/** True when photos can be read on this device. */
export const ocrAvailable = native !== null;

/** The text in a picture (a file URI from the camera or the photo picker), top to bottom. */
export async function recognizeText(uri: string): Promise<string> {
  if (!native) throw new Error('Reading text from pictures needs the iOS app.');
  return native.recognize(uri);
}
