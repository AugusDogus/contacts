declare global {
  namespace App {
    interface Locals {
      viewer: { id: string; name: string; email: string; kind: 'account' | 'demo' } | null;
    }
  }
}
export {};
