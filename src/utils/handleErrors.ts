/*
 * Gabe Dunn 2020
 * Functions that handle all our errors
 */

import { DevmodError } from '../types/errors/DevmodError'
import { logError } from './log'

export const handleErrors = (e: DevmodError) => {
    switch (e.name) {
        case 'NullGuildError':
        case 'NullChannelError':
        case 'NullRoleError':
            logError(e.area, e.message, e)
            process.exit(1)
            break
        case 'Error [TOKEN_INVALID]':
            logError('Login', 'The token provided was invalid.', e)
            process.exit(1)
            break
        default:
            logError(e.area, e.message, e)
            break
    }
}