type Notice = { message: string; tone: 'success' | 'error' };
export const notice: Notice = $state({ message: '', tone: 'success' });
let timer: ReturnType<typeof setTimeout> | undefined;
export function notify(message: string, tone: Notice['tone'] = 'success') {
  clearTimeout(timer);
  notice.message = message;
  notice.tone = tone;
  timer = setTimeout(() => {
    notice.message = '';
  }, 6000);
}
export function failure(cause: unknown) {
  notify(
    cause instanceof Error
      ? cause.message
      : 'That action could not be completed. Check your connection and try again.',
    'error'
  );
}
