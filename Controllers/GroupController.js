const {User, Token, Group, GroupMembers} = require("../models");
const {hash, compare} = require("bcrypt");
const {where} = require("sequelize");
const {sign} = require("jsonwebtoken");
const Joi = require("joi");
const {groupSchema} = require("../utils/schemas");
const {number} = require("joi");


class GroupControllers {
    async createGroup(req, res) {
        console.log(req.user_id)
        if (req.user_id === undefined) {
            return res.status(400).json({error: 'Token was not provided'});
        }

        try {
            await groupSchema.validateAsync(req.body)
        } catch (e) {
            return res.status(400).json({error: e.details[0].message});
        }

        const {group_name, password} = req.body
        const isGroupExist = await Group.findOne({where: {group_name: group_name}})

        if (isGroupExist !== null) {
            return res.status(400).json({error: "group_name is exist"});
        }

        const newGroup = await Group.create({
            group_name, password
        })

        GroupMembers.create({
            group_id: newGroup.id,
            user_id: req.user_id,
        })


        return res.status(200).json(newGroup.dataValues);



        //     const {group_name, password} = req.body
        //
        //     if (group_name === undefined || group_name === '') {
        //         return res.status(400).json('group_name is required')
        //     } else if (password === undefined || password === '') {
        //         return res.status(400).json('password is required')
        //     }
        //
        //     if (!!group_name && !!password ) {
        //
        //         const isUserExist = await User.findOne({where: {username: username}})
        //
        //         if (isUserExist === null) {
        //             const hashPassword = await hash(password, 10)
        //             const newUser = await User.create({
        //                 username, password: hashPassword, email
        //             })
        //             return res.status(200).json({
        //                 id: newUser.id, username: newUser.username, email: newUser.email
        //             })
        //         } else {
        //             return res.status(400).json('username is exist')
        //         }
        //     } else
        //     return res.status(400).send("Отправь мне эти ключи username, email, password")
    }

    async getGroup(req, res) {

        let participatedGroups = await GroupMembers.findAll({where: {user_id: req.user_id}})

        participatedGroups = participatedGroups.map(group => group.dataValues)

        return res.status(200).json({data: participatedGroups})
    }

    async deleteGroupMember(req, res) {
        const { group_id } = req.params;

        const isGroupExist = await Group.findOne({where: {id: group_id}})

        if (isGroupExist === null) {
            return res.status(400).json({ error: 'Group is not exist' });
        }

        const GroupMember = await GroupMembers.findOne({where: {group_id: group_id, user_id: req.user_id}})

        if (!GroupMember) {
            return res.status(400).json({ error: 'User is not in this group' });
        }

        await GroupMember.destroy()
        return res.status(204).json({});


    }

    // TODO: добавить найти группу
}


module.exports = new GroupControllers();