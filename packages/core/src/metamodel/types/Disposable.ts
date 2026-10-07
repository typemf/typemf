/** A handle that releases a subscription or resource when disposed. */
export interface Disposable {
  dispose(): void;
}
