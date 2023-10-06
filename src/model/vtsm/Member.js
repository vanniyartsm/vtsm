//Require Mongoose
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    mongoosePaginate = require('mongoose-paginate-v2'),
    timeZone = require('mongoose-timezone'),
    mongooseRecursiveUpsert = require('mongoose-recursive-upsert'),
    counter = require('../Counter'),
    SchemaTypes = mongoose.Schema.Types,
    SALT_WORK_FACTOR = 10;

var { FamilyReligionInfoSchema } = require('./FamilyReligionInfo')
var { PersonalInfoSchema } = require('./PersonalInfo')
var { ProfessionInfoSchema } = require('./ProfessionInfo')
var { ProfileInfoSchema } = require('./ProfileInfo')

var memberSchema = new Schema({
    seqId : {
        type: Number,
        unique: true
    },
    fullName: {
        type: String
    },
    emailAddress: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    transactionPassword: {
        type: String,
        required: true
    },
    dob: {
        type: Date
    },
    primaryMobile: {
        type: String
    },
    secondaryMobile: {
        type: String
    },
    status : {
        type: String
    },
    familyReligionInfo: FamilyReligionInfoSchema,
    personalInfo: PersonalInfoSchema,
    professionInfo: ProfessionInfoSchema,
    profileInfo: ProfileInfoSchema,
    active : {
        type: Boolean,
        default: false
    },
    verified : {
        type: Boolean,
        default: false
    }, 
    lastLogin: { type: Date },
    created: { type: Date, default: Date.now }, 
    updated: { type: Date, default: Date.now }
}, { collection: 'vtsm_mem_members' });

memberSchema.pre('save', function(next) {
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

memberSchema.post('save', function(doc) {
});

memberSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

memberSchema.plugin(mongoosePaginate);
memberSchema.plugin(mongooseRecursiveUpsert);
memberSchema.plugin(timeZone);

// Compile model from schema
var Member = mongoose.model('Member', memberSchema );
// make this available to our users in our Node applications
module.exports = Member;