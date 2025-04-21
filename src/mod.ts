import { DependencyContainer } from "tsyringe";

import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IQuest } from "@spt/models/eft/common/tables/IQuest";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

class Mod implements IPostSptLoadMod 
{
    private modConfig = require("./config/config.json");

    public postSptLoad(container: DependencyContainer): void 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables = databaseServer.getTables();
        const quests = tables.templates.quests as unknown as Record<string, IQuest>;

        if (this.modConfig.enableFlea) 
        {
            const globals = tables.globals.config;

            globals.RagFair.minUserLevel = this.modConfig.minFleaLevel;

            logger.logWithColor(`Flea Market Level changed to ${this.modConfig.minFleaLevel}`, LogTextColor.CYAN);
        }

        if (this.modConfig.removeFIRRequirements) 
        {
            Object.keys(quests).forEach((questId) => 
            {
                const currentQuest = quests[questId];

                if (currentQuest?.conditions?.AvailableForFinish.length) 
                {
                    currentQuest.conditions.AvailableForFinish.forEach((condition) => 
                    {
                        if (condition.conditionType === "FindItem") 
                        {
                            condition.onlyFoundInRaid = false;
                        }

                        if (condition.conditionType === "HandoverItem") 
                        {
                            condition.onlyFoundInRaid = false;
                        }
                    });
                }
            });

            logger.logWithColor("FIR Quest Requirements Removed", LogTextColor.CYAN);
        }

        if (this.modConfig.removeFIRHideout) 
        {
            for (const hideoutAreaData of Object.values(tables.hideout.areas)) 
            {
                for (const stage of Object.values(hideoutAreaData.stages)) 
                {
                    const requirements = stage.requirements;
                    if (requirements && requirements.length > 0) 
                    {
                        for (const requirement of requirements) 
                        {
                            if (Object.prototype.hasOwnProperty.call(requirement, "isSpawnedInSession"))
                            {
                                requirement.isSpawnedInSession = false;
                            }
                        }
                    }
                }
            }
        }
    }
}

export const mod = new Mod();
