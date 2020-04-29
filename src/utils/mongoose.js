var mongoose = require('mongoose');
import {host, port, user, pwd, db} from'../../config';

mongoose.set('debug', false);
mongoose.set('useFindAndModify', false);

mongoose.connect(`mongodb://${user}:${pwd}@${host}:${port}/${db}`, {useNewUrlParser: true});

module.exports = mongoose;