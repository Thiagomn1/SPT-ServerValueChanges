import { DependencyContainer } from "tsyringe";

import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IQuest } from "@spt/models/eft/common/tables/IQuest";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";

class Mod implements IPostSptLoadMod 
{
    public postSptLoad(container: DependencyContainer): void 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const tables = databaseServer.getTables();
        const quests = tables.templates.quests as unknown as Record<string, IQuest>;

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
}

export const mod = new Mod();
