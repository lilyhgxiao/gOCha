/* Constants are kept in this file for easy access and changes. */

//userschema attribute requirements
exports.minUserLength = 4;
exports.maxUserLength = 16;
exports.minEmailLength = 1;
exports.minPassLength = 1;
exports.maxPassLength = 60;
exports.defaultStars = 100;
exports.defaultSilvers = 0;
exports.maxUserBioLength = 400;

//gachaschema attribute requirements
exports.minGachaNameLength = 1;
exports.maxGachaNameLength = 50;
exports.maxGachaDescLength = 400;
exports.maxStatsLength = 10;
exports.maxCharaListLength = 200;

//charaschema attribute requirements
exports.minCharaNameLength = 1;
exports.maxCharaNameLength = 50;
exports.maxCharaDescLength = 400;
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
exports.gachaFolder = "gacha_images/";
exports.charaFolder = "chara_images/";
exports.userFolder = "user_images/";

//urls
exports.loginURL = "/";
exports.signupURL = "/signup";
exports.dashboardURL = "/dashboard";
exports.errorURL = "/error";
exports.collectionURL = "/collection";
exports.gachasURL = "/gachas";
exports.favouritesURL = "/favourites";
exports.smnInfoURL = "/summon/info/";
exports.smnResultURL = "/summon/result/";
exports.createGachaURL = "/create/gacha";
exports.editGachaURL = "/edit/gacha/";
exports.createCharaURL = "/create/chara/";
exports.editCharaURL = "/edit/chara/";
exports.profileURL = "/profile/";
exports.editAccURL = "/edit/acc/";

//page num nav constants
exports.pageRange = 5;
exports.charasPerPage = 20;
exports.gachasPerPage = 19;
exports.favGachasPerPage = 20;

//for testing purposes
exports.hostroot = "";