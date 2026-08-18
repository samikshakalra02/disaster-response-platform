const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`SIGNAL backend listening on http://localhost:${config.port}`);
});
