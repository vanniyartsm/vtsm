//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    mongoosePaginate = require('mongoose-paginate-v2'),
    timeZone = require('mongoose-timezone'),
    mongooseRecursiveUpsert = require('mongoose-recursive-upsert'),
    counter = require('./Counter'),
    SALT_WORK_FACTOR = 10;

//var ancestorSchema = new Schema({ level: {type: Number}, referralCode : {type: String}, percentage : {type: Number}, count : {type: Number} });

var lotSchema = new Schema({ lotId : {type: String}, numberOfUnits : {type: Number}, numberOfPoints : {type: Number}, purchaseId : {type: String}, created: { type: Date}, updated: { type: Date}, type : {type: String}, status : {type: String}});

var UserSchema = new Schema({
    seqId : {
        type: Number,
        unique: true
    },
    userName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    transactionPassword: {
        type: String,
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    emailAddress: {
        type: String
    },
    phoneNo: {
      type: String
    },
    sponsorId : {
        type : String
    },
    sponsorName : {
        type : String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    referralCode : {
        type : String
    },
    status : {
        type: String
    },
    ancestorPath : {
        type : String
    },
    //ancestor: [ancestorSchema],
    ancestor : {
        type: [Object]
    },
    address : {
        type: Object
    },
    btcwallet : {
        type: String
    },
    active : {
        type: Boolean,
        default: false
    },
    path : {
        type: String
    },
    left : {
        type: String
    },
    right : {
        type: String
    },
    leftMost : {
        type: String
    },
    rightMost : {
        type: String
    },
    position : {
        type: String
    },
    parentId : {
        type: String
    },
    lots: [lotSchema],
    downlineLots : {type : Number, defaule : 0},
    processed : {type: Boolean},
    downlineStatus : {type: String},
    bCount : {type : Number, defaule : 0},
    sbCount : {type : Number, defaule : 0},
    leftCount : {type : Number, defaule : 0},
    rightCount : {type : Number, defaule : 0},
    puLeftBCount : {type : Number, defaule : 0},
    puRightBCount : {type : Number, defaule : 0},
    puLeftSBCount : {type : Number, defaule : 0},
    puRightSBCount : {type : Number, defaule : 0},
    activatedDate: { type: Date, default: Date.now},
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
}, { collection: 'users' });

UserSchema.pre('save', function(next) {
    var user = this;
    counter.findByIdAndUpdate({_id: '59678bf65a12076ff0cc7891'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error) return next(error);
        user.seqId = counter.seq;
        
        if (!user.created) user.created = new Date;
        if (!user.activatedDate) user.activatedDate = new Date;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password along with our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);
                user.password = hash;

                bcrypt.hash(user.transactionPassword, salt, function(err, transHash) {
                    if (err) return next(err);
                    console.info('err = ', err);
                    // override the cleartext password with the hashed one
                    user.transactionPassword = transHash;
                    next();
                });
            });
        });
    });
});

UserSchema.post('save', function(doc) {
    var user = this;
    //console.info('doc = ', doc);
    //console.info('doc path = ', doc.path);
    /*if (doc.path == undefined) {
        userServiceImpl.getSponsor(doc.sponsorId, function(err, sponsor) {
            console.info('post save sponsor = ', sponsor);
            var path = null;
            var userJson = {};
            if (user.sponsorId != -1) {
                path = ',' + sponsor._id + ',';
            }
            userJson.path = path;
            userJson.id = doc._id;

            userServiceImpl.updateUserPath(userJson, function(error, uUser)   {
                //next();
                console.info('uUser = ', uUser);
            });
        });
    }*/
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(mongooseRecursiveUpsert);
UserSchema.plugin(timeZone);

// Compile model from schema
var User = mongoose.model('User', UserSchema );
// make this available to our users in our Node applications
module.exports = User;