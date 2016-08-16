const userController = {};
const bcrypt = require('bcryptjs');
const User = require('./userModel');
const SessionCtrl = require('./sessionController');

userController.createUser = (req, res) => {
  User.create(req.body, (err, data) => {
    if (err) {
      // throw err
      // console.log(err);
      return res.status(500).send('showAlert');
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(data.password, salt);
    data.password = hash;
    res.cookie('SSID', data.id);
    // console.log('id: ', data.id);
    SessionCtrl.startSession(req, res, data._id);
    data.save();
    return res.json({ userId: data.id });
  });
};

userController.verify = (req, res) => {
  User.findOne({
    username: req.body.username,
  }, (err, doc) => {
    if (doc) {
      if (bcrypt.compareSync(req.body.password, doc.password)) {
        res.cookie('SSID', doc.id);
        SessionCtrl.startSession(req, res, doc._id);
        // console.log('verified');
        return res.json({ userId: doc.id });
      }
      return res.send('error: ', err);
    }
    return userController.createUser(req, res);
  });
};


module.exports = userController;
