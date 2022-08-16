const logger = require('../services/logger.service')
const authService = require('../api/auth/auth.service')

// the middleware is reponsible for ahutorized who can do rest operations

// Check if the is user logged in
async function requireAuth(req, res, next) {
   // Check in req is loginToken exists
   if (!req?.cookies?.loginToken) return res.status(401).send('Not Authenticated')
   // decrypt loginToken with the library cryptr and return JSON.parse(json)
   const loggedinUser = authService.validateToken(req.cookies.loginToken)
   if (!loggedinUser) return res.status(401).send('Not Authenticated')
   // move to the next middleware
   next()
}

async function requireAdmin(req, res, next) {
   // Check in req is loginToken exists
   if (!req?.cookies?.loginToken) return res.status(401).send('Not Authenticated')
   // decrypt loginToken with the library cryptr and return JSON.parse(json)
   const loggedinUser = authService.validateToken(req.cookies.loginToken)
   // Check if is admin
   if (!loggedinUser.isAdmin) {
      logger.warn(loggedinUser.fullname + 'attempted to perform admin action')
      res.status(403).end('Not Authorized')
      return
   }
   // if is admin then continue to next
   next()
}

module.exports = {
   requireAuth,
   requireAdmin
}
