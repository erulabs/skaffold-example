// @flow

const sgMail = require('@sendgrid/mail')
const { SENDGRID_API_KEY, EMAIL_FROM_ADDR } = require('./config')
const logger = require('./logger')

/* flow-include
import type { emailDataType } from './models/Email'
*/

// $FlowIssue
sgMail.setApiKey(SENDGRID_API_KEY)

function sendEmail(msg /*: emailDataType */) {
  if (SENDGRID_API_KEY) {
    if (!msg.from) {
      msg.from = EMAIL_FROM_ADDR
    }
    if (msg.to.indexOf('test-not-real-yo.com') > -1) {
      logger.info('Not sending email to test-not-real-yo.com', msg)
    } else {
      logger.info('Sending email:', { to: msg.to, template: msg.template })
      // $FlowIssue
      return sgMail.send(msg)
    }
  } else {
    logger.warn('No SENDGRID_API_KEY defined, not sending email!', {
      to: msg.to
    })
  }
}

module.exports = { sendEmail }
