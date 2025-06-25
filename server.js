const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot rodando'));
app.listen(3000);