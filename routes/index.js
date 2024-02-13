const router = require('express').Router();
const apiRoutes = require('./api');

router.use('/api', apiRoutes);

router.use((req, res) => {
  return res.send('this is not the route you are looking for - obi wan kenobi i think...');
});

module.exports = router;
