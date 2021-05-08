function allowUserDeleteAccess(req, res, next) {
	if (+req.signedCookies.user_id === +req.params.id) {
		next();
	} else {
		res.status(401);
		res.json({message: 'Unauthorized'});
	}
}

function allowScoreSubmissionAccess(req, res, next) {
	if (+req.signedCookies.user_id === +req.body.user_id) {
		next();
	} else {
		res.status(401);
		res.json({message: 'Unauthorized'});
	}
}

module.exports = {
	allowUserDeleteAccess,
	allowScoreSubmissionAccess,
}