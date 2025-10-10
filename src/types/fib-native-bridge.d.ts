// Type augmentation for the FIB Native Bridge global
// https://first-iraqi-bank.github.io/fib-nodejs-payment-sdk/guide/usage/native-app-bridge.html

declare global {
  interface Window {
    FIBNativeBridge: FIBNativeBridge
  }
}

export interface FIBMessageBodyAuthenticate {
  readableId: string
}

export interface FIBMessageBodyPayment {
  transactionId: string
  readableId: string
}

export type FIBSendableMessage =
  | { type: 'AUTHENTICATE'; body: FIBMessageBodyAuthenticate }
  | { type: 'PAYMENT'; body: FIBMessageBodyPayment }
  | { type: 'EXIT' }

export type FIBReceivableEventType =
  | 'AUTHENTICATED'
  | 'AUTHENTICATION_FAILED'
  | 'PAYMENT_SUCCESSFULLY_PAID'
  | 'PAYMENT_FAILED'

export interface FIBEventDetail<TBody = unknown> {
  body: TBody
}

export interface FIBEvent<TBody = unknown> extends Event {
  detail: FIBEventDetail<TBody>
}

export interface FIBNativeBridge extends EventTarget {
  isFIBBridgeAvailable: boolean
  sendMessage: (message: FIBSendableMessage) => void
  addEventListener: (
    type: FIBReceivableEventType,
    listener: (evt: FIBEvent<unknown>) => void,
    options?: boolean | AddEventListenerOptions
  ) => void
  removeEventListener: (
    type: FIBReceivableEventType,
    listener: (evt: FIBEvent<unknown>) => void,
    options?: boolean | EventListenerOptions
  ) => void
}

export {}
