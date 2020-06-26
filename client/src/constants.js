/* Constants are kept in this file for easy access and changes. */

//userschema attribute requirements
exports.minUserLength = 4;
exports.maxUserLength = 16;
exports.minEmailLength = 1;
exports.minPassLength = 1;
exports.maxPassLength = 60;
exports.defaultStars = 100;
exports.defaultSilvers = 0;

//gachaschema attribute requirements
exports.minGachaNameLength = 1;
exports.maxGachaNameLength = 50;
exports.maxGachaDescLength = 240;
exports.maxStatsLength = 10;

//charaschema attribute requirements
exports.minCharaNameLength = 1;
exports.maxCharaNameLength = 50;
exports.maxCharaDescLength = 50;
exports.maxWelcPhrLength = 140;
exports.maxSummPhrLength = 140;

//chara summon percentages
exports.fiveStarChance = 0.06;
exports.fourStarChance = 0.20;
exports.threeStarChance = 0.74;

//costs
exports.summonCost = 100;
exports.threeStarSilvers = 10;
exports.fourStarSilvers = 30;
exports.fiveStarSilvers = 100;

//amazon s3 url root 
exports.s3URL = "https://gocha.s3.ca-central-1.amazonaws.com/";