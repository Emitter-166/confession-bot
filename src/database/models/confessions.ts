import { Sequelize, INTEGER, CHAR, STRING } from "sequelize";

export const model = (sequelize: Sequelize) => {
    sequelize.define('confessions', {
       userId: {
        type: CHAR(20)
       },
       confession: {
        type: STRING
       },
       confessionId: {
        type: CHAR(25)
       },
       confessedAt: {
        type: INTEGER
       }
    }, {timestamps: false})
}