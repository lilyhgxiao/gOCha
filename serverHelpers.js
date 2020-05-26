/*** Helper functions **************************************/

export function cleanGachaUpdateReq(req) {
    const reqBody = {};
    if (req.body) {
        if (req.body.name) reqBody.name = req.body.name;
        if (req.body.desc) reqBody.desc = req.body.desc;
        if (req.body.coverPic) reqBody.coverPic = req.body.coverPic;
        if (req.body.iconPic) reqBody.iconPic = req.body.iconPic;
        if (req.body.stats) reqBody.stats = req.body.stats;
        if (req.body.threeStars) reqBody.threeStars = req.body.threeStars;
        if (req.body.fourStars) reqBody.fourStars = req.body.fourStars;
        if (req.body.fiveStars) reqBody.fiveStars = req.body.fiveStars;
        if (req.body.creator) reqBody.creator = req.body.creator;
    }
    return reqBody;
};

export function cleanCharaUpdateReq(req) {
    const reqBody = {};
    if (req.body) {
        if (req.body.name) reqBody.name = req.body.name;
        if (req.body.rarity) reqBody.rarity = req.body.rarity;
        if (req.body.desc) reqBody.desc = req.body.desc;
        if (req.body.mainPic) reqBody.mainPic = req.body.mainPic;
        if (req.body.iconPic) reqBody.iconPic = req.body.iconPic;
        if (req.body.stats) reqBody.stats = req.body.stats;
        if (req.body.gacha) reqBody.gacha = req.body.gacha;
        if (req.body.creator) reqBody.creator = req.body.creator;
    }
    return reqBody;
};

export function cleanUserUpdateReq(req) {
    const reqBody = {};

    if (req.body) {
        if (req.body.username) reqBody.username = req.body.username;
        if (req.body.email) reqBody.email = req.body.email;
        if (req.body.password) reqBody.password = req.body.password;
        if (req.body.isAdmin) reqBody.isAdmin = req.body.isAdmin;
        if (req.body.profilePic) reqBody.profilePic = req.body.profilePic;
        if (req.body.starFrags) reqBody.starFrags = req.body.starFrags;
        if (req.body.silvers) reqBody.silvers = req.body.silvers;
        if (req.body.ownGachas) reqBody.ownGachas = req.body.ownGachas;
        if (req.body.favGachas) reqBody.favGachas = req.body.favGachas;
        if (req.body.inventory) reqBody.inventory = req.body.inventory;
        if (req.body.lastLoginDate) reqBody.lastLoginDate = req.body.lastLoginDate;
    }
    return reqBody;
};