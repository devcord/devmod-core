/*
 * André Weller 2020
 * Process file for the antiraid listener
 */

import { Client, Message } from 'discord.js'
import { ConfigInterface } from '../types/interfaces/ConfigInterface'
import { ProcessInterface } from '../types/interfaces/ProcessInterface'
import { SubmodulesInterface } from '../types/interfaces/SubmodulesInterface'

import * as moment from 'moment'

export const antiraidListener: ProcessInterface = {
    name: 'AntiraidListener',
    init(client: Client, config: ConfigInterface, sub: SubmodulesInterface) {
        const mentions = new Map()
        const mutedRole = config.roleIDs.muted

        // NOTE: Pull from config, same role is achieved
        const staffRoleId = config.roleIDs.staff
        // const staffRole = 662405675107876864

        // NOTE: Get role from config
        const seniorRoleId = config.roleIDs.senior

        // DEBUG: Debug console log for role comparison
        // console.log(staffRole, seniorRole)

        client.on('message', async (message: Message) => {
            const lastKnownTimestamp = mentions.get(message.author.id) ?? null

            const userRoleIds = message.member.roles.cache.map(r => r.id)

            // Staff role is not used as of now
            const isStaff = userRoleIds.find(r => r === staffRoleId)
            const isSenior = userRoleIds.find(r => r === seniorRoleId)

            if (isStaff || isSenior) {
                return
            } else {
                const {
                    users: { size: mentionedUsers },
                    roles: { size: mentionedRoles }
                } = message.mentions

                if (
                    mentionedRoles > 1 ||
                    mentionedUsers > 2 ||
                    mentionedUsers + mentionedRoles > 2
                ) {
                    lastKnownTimestamp
                        ? checkOffender(message, lastKnownTimestamp)
                        : addOffenderToList(message)
                }
            }
        })

        const addOffenderToList = message => {
            mentions.set(message.author.id, [message.createdTimestamp])
        }

        const checkOffender = (message, lastKnownTimestamp) => {
            const startDate = moment(message.createdTimestamp * 1000)
            const endDate = moment(lastKnownTimestamp * 1000)

            const diff = startDate.diff(endDate)

            diff > 10 ? triggerAntiraid(message) : addOffenderToList(message)
        }

        const triggerAntiraid = async message => {
            await message.delete()
            message.member.roles.add(mutedRole)
            // NOTE: This worked in development, should work in production
            // TODO: Send message to #mod-log
            message.channel.send(
                `<@${message.author.id}> messed with the honk, so he got the bonk. (<@&${staffRoleId}>)`
            )
        }
    }
}
