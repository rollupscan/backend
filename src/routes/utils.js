module.exports = (app) => {
  app.handle('utils.ping', (data, send, next) => send('pong'))
}
