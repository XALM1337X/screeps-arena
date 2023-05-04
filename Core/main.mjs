import { getObjectsByPrototype } from '/game/utils';
import { Creep, StructureSpawn, Source, StructureExtension, StructureContainer } from '/game/prototypes';
import { OK, ERR_FULL, ERR_NOT_ENOUGH_RESOURCES,  ERR_NOT_IN_RANGE, ERR_INVALID_TARGET, MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, RESOURCE_ENERGY, TOP, TOP_RIGHT, BOTTOM, BOTTOM_RIGHT, RIGHT, TOP_LEFT, BOTTOM_LEFT, LEFT} from '/game/constants';
import { utils, arenaInfo,Visual } from '/game';
import { getTicks } from '/game/utils';
import { findClosestByPath } from 'game/utils';

let TState = {

    //State Properties
    visual_debugger: new Visual(10, true),
    //TState.visual_debugger.line(Group.Zone.TopRightPos, Group.Zone.TopLeftPos,{color: '#ff0000'});    
    SpawnDelay: false,
    Preflight: false,
    AvailableEnergy: 0,
    CreepGroupIdTicker: 0,
    CreepIdTicker: 0,
    GameType: "",    
    TechLevel: "TIER0", 
    TechLevelKeys: ["TIER0", "TIER1", "TIER2", "TIER3", "TIER4"],
    GroupKeys: ["harvester_group", "build_group", "defense_group", "attack_group", "capture_group"],
    ZoneOffsets: {
        attack_group: 7,
        defense_group: 4,
        harvester_group: 3,
        build_group: 3,
    },
    GameTypeKeys: ["CTF","CAC","SAS"],
    GroupTierCriteria: [],
    CreepBodyTierCriteria: [],
    CreepBodyPartPrices: {
        Work: 100,
        Move: 50,
        Carry: 50,
        Attack: 80,
        RangedAttack: 150,
        Heal: 250,
        Tough: 10,
    },

    ExitStatus: 0,

    //World objects
    Spawns:  [],
    CreepGroups: [],
    StructureList: [],
    ConstructionSites: [],
    Towers: [],
    WorldContainers: [],
    WorldResources: [],
    ModuleReinitList: [],
    Extensions: [],
    Containers: [],
    RoomSources: [],
    EnemyCreeps:[],
    EnemyStructures:[],
    EnemyTowers:[],
    EnemySpawns:[],

    //Creep Triggers
    NeedContainerScan: false,

    //Queues
    SpawnQueue: [],

    Init: {
        InitMain:function() {
            TState.Init.InitGameType();
            if (TState.GameType == "SAS") {            
                if (arenaInfo.level == 1) {
                    TState.Init.InitSASSTD();
                } else if (arenaInfo.level > 1) {
                    TState.Init.InitSASADV();
                }
            } else if (TState.GameType == "CAC") {
                if (arenaInfo.level == 1) {
                    TState.Init.InitCACSTD();
                } else if (arenaInfo.level > 1) {
                    TState.Init.InitCACADV();
                }
            } else if (TState.GameType == "CTF") {
                if (arenaInfo.level == 1) {
                    TState.Init.InitCTFSTD();
                } else if (arenaInfo.level > 1) {
                    TState.Init.InitCTFADV();
                }
            } 
            TState.Preflight = true;
        },
        InitGameType:function () {
            if (arenaInfo.name == "Spawn and Swamp") {
                TState.GameType = "SAS";
            } else if (arenaInfo.name == "Collect and Control") {
                TState.GameType = "CAC";
            } else if (arenaInfo.name == "Capture the Flag") { 
                TState.GameType = "CTF";
            }
        },
        InitCTFSTD:function() {

        },
        InitCTFADV:function() {

        },
        InitCACSTD:function() {

        },
        InitCACADV:function() {

        },
        InitSASSTD:function() {
            TState.Structures.Spawn.InitSpawn();
            TState.Structures.Spawn.InitEnemySpawn();
            TState.Structures.InitEnergySupply();
            TState.Structures.Containers.InitContainers();
            TState.Groups.Creeps.InitCreepBodyTierCriteria();
            TState.Groups.InitGroupTierCriteria();
            TState.Groups.InitGroups();
            TState.Groups.InitGroupZones();
            TState.Groups.InitCreepWrappers();
            TState.Structures.Spawn.InitSpawnQueue();
            TState.Groups.Creeps.ScanEnemyCreeps();
        },
        InitSASADV:function() {
            TState.Structures.Spawn.InitSpawn();
            TState.Structures.Spawn.InitEnemySpawn();
            TState.Structures.InitEnergySupply();
            TState.Structures.Containers.InitContainers();
            TState.Groups.Creeps.InitCreepBodyTierCriteria();
            TState.Creeps.InitSpecialSNSADVCreep();
            TState.Groups.InitGroupTierCriteria();
            TState.Groups.InitGroups();
            TState.Groups.InitCreepWrappers();
            TState.Structures.Spawn.InitSpawnQueue();
            TState.Groups.Creeps.ScanEnemyCreeps();
        },    
    },
    RunTime : {
        RunGroups:function () {
            TState.visual_debugger.clear();
            for (let key in TState.CreepGroups) {
                for(let i = 0; i < TState.CreepGroups[key].length; i++) {
                    TState.RunTime.RunGroupMind(TState.CreepGroups[key][i]);
                    for(let j = 0; j < TState.CreepGroups[key][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "harvester" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "transporter" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                TState.RunTime.RunTransporter(TState.CreepGroups[key][i].CreepsWrapper[j], TState.CreepGroups[key][i]);
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "builder" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {

                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "melee" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                TState.RunTime.RunAttacker(TState.CreepGroups[key][i].CreepsWrapper[j], TState.CreepGroups[key][i]);
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "ranged" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                TState.RunTime.RunRanged(TState.CreepGroups[key][i].CreepsWrapper[j], TState.CreepGroups[key][i]);
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "healer" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                TState.RunTime.RunHealer(TState.CreepGroups[key][i].CreepsWrapper[j], TState.CreepGroups[key][i]);
                            }
                        }
                    }
                }
            }
        },
        RunGroupMind:function(Group) {            
            TState.Groups.ScanGroupLeader(Group);            
            TState.Groups.RepositionGroupZone(Group);
            TState.Groups.CheckGroupZoneState(Group);
            TState.Groups.CheckGroupEnemyAgroZoneState(Group);
        },
        RunAttacker:function(CreepWrapper, Group) {
            if (!CreepWrapper.CreepObj || CreepWrapper.CreepObj.hits == undefined || CreepWrapper.CreepObj.hits == null) {
                if (!TState.SpawnQueue.find(e => e.ID != CreepWrapper.ID)) {
                    TState.Groups.RequeueDeadCreep(CreepWrapper);
                }
            }
            if (Group.GroupIsReady) {   
                switch (Group.Type) {
                    case "attack_group":
                        if (!CreepWrapper.CurrentTarget || getTicks() % 5 == 0) {
                            if (Group.AgroZoneEnemies.length > 0) {
                                CreepWrapper.CurrentTarget = findClosestByPath(CreepWrapper.CreepObj, Group.AgroZoneEnemies);
                            } else {
                                CreepWrapper.CurrentTarget = TState.EnemySpawns[0];
                            }                            
                        }
                        let ret_code = CreepWrapper.CreepObj.attack(CreepWrapper.CurrentTarget);
                        if (ret_code == ERR_NOT_IN_RANGE) {
                            let ret_code = CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget); 
                            if (ret_code != 0) {
                                console.log("ERROR_RUN_ATTACK_MOVE(0)");
                            }
                        } else if (ret_code == ERR_INVALID_TARGET) {
                            CreepWrapper.CurrentTarget = null;
                        }

                    break;
                    case "defense_group":
                        if (!CreepWrapper.CurrentTarget) {
                            if (Group.AgroZoneEnemies.length > 0) {
                                CreepWrapper.CurrentTarget = findClosestByPath(CreepWrapper.CreepObj, Group.AgroZoneEnemies);
                            } else {
                                if (CreepWrapper.CreepObj.x == Group.Zone.BottomLeftPos.x && CreepWrapper.CreepObj.y == Group.Zone.BottomLeftPos.y) {
                                    CreepWrapper.CurrentTarget = Group.Zone.TopLeftPos;
                                } else if (CreepWrapper.CreepObj.x == Group.Zone.TopLeftPos.x && CreepWrapper.CreepObj.y == Group.Zone.TopLeftPos.y) {
                                    CreepWrapper.CurrentTarget = Group.Zone.TopRightPos;
                                } else if (CreepWrapper.CreepObj.x == Group.Zone.TopRightPos.x && CreepWrapper.CreepObj.y == Group.Zone.TopRightPos.y) {
                                    CreepWrapper.CurrentTarget = Group.Zone.BottomRightPos;
                                } else if (CreepWrapper.CreepObj.x == Group.Zone.BottomRightPos.x && CreepWrapper.CreepObj.y == Group.Zone.BottomRightPos.y) {
                                    CreepWrapper.CurrentTarget = Group.Zone.BottomLeftPos;
                                } else {
                                    switch (getTicks() % 4) {
                                        case 0:
                                            CreepWrapper.CurrentTarget = Group.Zone.BottomLeftPos;
                                        break;                                        
                                        case 1:
                                            CreepWrapper.CurrentTarget = Group.Zone.BottomRightPos;
                                        break;
                                        case 2:
                                            CreepWrapper.CurrentTarget = Group.Zone.TopRightPos;
                                        break;
                                        case 3:
                                            CreepWrapper.CurrentTarget = Group.Zone.TopLeftPos;
                                        break;
                                    }
                                }
                            }
                        } else {
                            if (Group.AgroZoneEnemies.length > 0) {
                                CreepWrapper.CurrentTarget = findClosestByPath(CreepWrapper.CreepObj, Group.AgroZoneEnemies);
                            }

                            if (JSON.stringify(CreepWrapper.CurrentTarget) === JSON.stringify(Group.Zone.BottomLeftPos)) {
                                CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget);
                                if (CreepWrapper.CreepObj.x == Group.Zone.BottomLeftPos.x && CreepWrapper.CreepObj.y == Group.Zone.BottomLeftPos.y) {
                                    CreepWrapper.CurrentTarget = null;
                                }

                            } else if (JSON.stringify(CreepWrapper.CurrentTarget) === JSON.stringify(Group.Zone.BottomRightPos)) {
                                CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget);
                                if (CreepWrapper.CreepObj.x == Group.Zone.BottomRightPos.x && CreepWrapper.CreepObj.y == Group.Zone.BottomRightPos.y) {
                                    CreepWrapper.CurrentTarget = null;
                                }

                            } else if (JSON.stringify(CreepWrapper.CurrentTarget) === JSON.stringify(Group.Zone.TopLeftPos)) {
                                CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget);
                                if (CreepWrapper.CreepObj.x == Group.Zone.TopLeftPos.x && CreepWrapper.CreepObj.y == Group.Zone.TopLeftPos.y) {
                                    CreepWrapper.CurrentTarget = null;
                                }

                            } else if (JSON.stringify(CreepWrapper.CurrentTarget) === JSON.stringify(Group.Zone.TopRightPos)) {
                                CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget);
                                if (CreepWrapper.CreepObj.x == Group.Zone.TopRightPos.x && CreepWrapper.CreepObj.y == Group.Zone.TopRightPos.y) {
                                    CreepWrapper.CurrentTarget = null;
                                }

                            } else {
                                let ret_code = CreepWrapper.CreepObj.attack(CreepWrapper.CurrentTarget);
                                if (ret_code == ERR_NOT_IN_RANGE) {
                                    let ret_code = CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget); 
                                    if (ret_code != 0) {
                                        console.log("ERROR_RUN_ATTACK_MOVE(0)");
                                    }
                                } else if (ret_code == ERR_INVALID_TARGET) {
                                    CreepWrapper.CurrentTarget = null;
                                }
                            }
                        }
                    break;
                    case "harvester_group":
                    break;
                    case "build_group":
                    break;
                    case "capture_group":
                    break;
                }
            } else {
                switch (Group.Type) {
                    case "attack_group":
                    break;
                    case "defense_group":
                    break;
                    case "harvester_group":
                    break;
                    case "build_group":
                    break;
                    case "capture_group":
                    break;
                }
            }
        },
        RunRanged:function(CreepWrapper, Group) {
            if (!CreepWrapper.CreepObj || CreepWrapper.CreepObj.hits == undefined || CreepWrapper.CreepObj.hits == null) {
                if (!TState.SpawnQueue.find(e => e.ID != CreepWrapper.ID)) {
                    TState.Groups.RequeueDeadCreep(CreepWrapper);
                }
            }
            if (Group.GroupIsReady) {             
                switch (Group.Type) {
                    case "attack_group":
                    break;
                    case "defense_group":
                    break;
                    case "harvester_group":
                    break;
                    case "build_group":
                    break;
                    case "capture_group":
                    break;
                }
            } else {
                switch (Group.Type) {
                    case "attack_group":
                    break;
                    case "defense_group":
                    break;
                    case "harvester_group":
                    break;
                    case "build_group":
                    break;
                    case "capture_group":
                    break;
                }
            }
        },
        RunHealer:function(CreepWrapper, Group) {
            if (!CreepWrapper.CreepObj || CreepWrapper.CreepObj.hits == undefined || CreepWrapper.CreepObj.hits == null) {
                if (!TState.SpawnQueue.find(e => e.ID != CreepWrapper.ID)) {
                    TState.Groups.RequeueDeadCreep(CreepWrapper);
                }
            }
            if (Group.GroupIsReady) {             
                switch (Group.Type) {
                    case "attack_group":
                    break;
                    case "defense_group":
                    break;
                    case "harvester_group":
                    break;
                    case "build_group":
                    break;
                    case "capture_group":
                    break;
                }
            } else {
                switch (Group.Type) {
                    case "attack_group":
                    break;
                    case "defense_group":
                    break;
                    case "harvester_group":
                    break;
                    case "build_group":
                    break;
                    case "capture_group":
                    break;
                }
            }
        },
        RunHarvester:function(CreepWrapper, Group) {

            if (!CreepWrapper.CurrentTarget) {
                if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] <= 0) {
                    CreepWrapper.CurrentStatus = "source-search";
                } else if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] == CreepWrapper.CreepObj.store.getCapacity(RESOURCE_ENERGY)) {
                    CreepWrapper.CurrentStatus = "target-search";
                } else if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] > 0) {
                    CreepWrapper.CurrentStatus = "source-search";
                }
                switch (CreepWrapper.CurrentStatus) {
                    case "source-search":
                        var closest = undefined;
                        for (let i = 0; i < TState.RoomSources.length; i++) {
                            if (!closest) {
                                closest = TState.RoomSources[i];
                                continue;
                            }
                            if (TState.Utils.getDistance(CreepWrapper.CreepObj, TState.RoomSources[i]) < closest) {
                                closest = TState.RoomSources[i];
                            }
                        }
                        CreepWrapper.CurrentTarget = closest;
                        CreepWrapper.TargetType = "source";
                        CreepWrapper.CurrentStatus = "harvest";
                    break;

                    case "target-search":
                        var closest = undefined;
                        for (let i = 0; i < TState.Spawns.length; i++) {
                            if (TState.Spawns[i].store[RESOURCE_ENERGY] < TState.Spawns[i].store.getCapacity(RESOURCE_ENERGY)) {
                                CreepWrapper.TargetType = "spawn";
                                CreepWrapper.CurrentTarget = TState.Spawns[i];
                                CreepWrapper.CurrentStatus = "deposit";
                                break;
                            }
                        }
                    break;
                }
            } else {
                switch(CreepWrapper.CurrentStatus) {
                    case "harvest":
                        if (CreepWrapper.CreepObj.harvest(CreepWrapper.CurrentTarget) != OK) {
                            CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget);
                        }
                        if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] == CreepWrapper.CreepObj.store.getCapacity(RESOURCE_ENERGY)) {
                            CreepWrapper.CurrentTarget = undefined;
                            CreepWrapper.TargetType = ""
                            CreepWrapper.CurrentStatus = undefined;
                        }
                    break;

                    case "deposit":
                        if (CreepWrapper.CreepObj.transfer(CreepWrapper.CurrentTarget, RESOURCE_ENERGY) != OK) {
                            CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget);
                        }
                        if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] > 0 && CreepWrapper.CurrentTarget.store[RESOURCE_ENERGY] == CreepWrapper.CurrentTarget.store.getCapacity(RESOURCE_ENERGY)) {
                            CreepWrapper.CurrentTarget = undefined;
                            CreepWrapper.TargetType = ""
                            CreepWrapper.CurrentStatus = undefined;
                        }


                        if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] == 0) {
                            CreepWrapper.CurrentTarget = undefined;
                            CreepWrapper.TargetType = ""
                            CreepWrapper.CurrentStatus = undefined;
                        }
                        
                    break;
                }
            }
        },
        RunTransporter:function(CreepWrapper, Group) {
            if (!CreepWrapper.CreepObj || CreepWrapper.CreepObj.hits == undefined || CreepWrapper.CreepObj.hits == null) {
                if (!TState.SpawnQueue.find(e => e.ID != CreepWrapper.ID)) {
                    TState.Groups.RequeueDeadCreep(CreepWrapper);
                }
            }

            if (!CreepWrapper.CreepObj.store){
                return;
            }
            if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] <= 0) {
                CreepWrapper.CurrentStatus = "container-search";
            } else if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] == CreepWrapper.CreepObj.store.getCapacity(RESOURCE_ENERGY)) {
                CreepWrapper.CurrentStatus = "spawn-drop";
            } else if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] > 0) {
                CreepWrapper.CurrentStatus = "container-search";
            }
            if (CreepWrapper.CurrentStatus == "container-search") {
                if (CreepWrapper.CurrentTarget && !CreepWrapper.CurrentTarget.store) {
                    CreepWrapper.CurrentTarget = null;
                }
                if (!CreepWrapper.CurrentTarget) {
                    CreepWrapper.CurrentTarget = findClosestByPath(TState.Spawns[0], TState.Containers);
                    if (CreepWrapper.CurrentTarget == null || !CreepWrapper.CurrentTarget.store) {
                        TState.NeedContainerScan = true;
                        CreepWrapper.CurrentTarget = null;
                        if (CreepWrapper.CreepObj.store[RESOURCE_ENERGY] > 0) {
                            CreepWrapper.CurrentStatus = "spawn-drop";
                            CreepWrapper.CurrentTarget = null;
                        }
                    }
                } else {
                    
                    if (CreepWrapper.CreepObj.withdraw(CreepWrapper.CurrentTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        CreepWrapper.CreepObj.moveTo(CreepWrapper.CurrentTarget);
                    } else if (CreepWrapper.CreepObj.withdraw(CreepWrapper.CurrentTarget, RESOURCE_ENERGY) == ERR_INVALID_TARGET) {
                        CreepWrapper.CurrentTarget = null;
                    } else if (CreepWrapper.CreepObj.withdraw(CreepWrapper.CurrentTarget, RESOURCE_ENERGY) == ERR_FULL) {
                        CreepWrapper.CurrentStatus == "spawn-drop";
                    } else if (CreepWrapper.CreepObj.withdraw(CreepWrapper.CurrentTarget, RESOURCE_ENERGY) ==ERR_NOT_ENOUGH_RESOURCES) {
                        TState.NeedContainerScan = true;
                        CreepWrapper.CurrentTarget = null;
                        CreepWrapper.CurrentStatus = "spawn-drop";
                    }
                }
            } else if (CreepWrapper.CurrentStatus == "spawn-drop") {
                if (CreepWrapper.CreepObj.transfer(TState.Spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    CreepWrapper.CreepObj.moveTo(TState.Spawns[0]);
                } else if (CreepWrapper.CreepObj.transfer(TState.Spawns[0], RESOURCE_ENERGY) == ERR_NOT_ENOUGH_RESOURCES) {
                    CreepWrapper.CurrentStatus = "container-search";
                    CreepWrapper.CurrentTarget = null;
                }
            } else {
                console.log("transporter: Unkown state");
                console.log(CreepWrapper.CurrentStatus);
            }

        },
        StateUpdate:function() {
            TState.Groups.Creeps.ScanEnemyCreeps();
        },
        Utils: {
            getDistance:function(obj1, obj2) {
                let ydiff = obj2.y - obj1.y;
                let xdiff = obj2.x - obj1.x;
                return Math.sqrt((ydiff*ydiff)+(xdiff*xdiff))
            },
            ZoneToZoneCollisionCheck:function(obj1, obj2) {
                
                //The sides of the rectangles
                let leftA = 0;
                let leftB = 0;
                let rightA = 0;
                let rightB = 0;
                let topA = 0;
                let topB = 0;
                let bottomA = 0;
                let bottomB = 0;

                //Calculate the sides of rect A
                leftA = obj1.Zone.TopLeftPos.x;
                rightA = obj1.Zone.TopRightPos.x;
                topA = obj1.Zone.TopRightPos.y;
                bottomA = obj1.Zone.BottomLeftPos.y;

                //Calculate the sides of rect B
                leftB = obj2.Zone.TopLeftPos.x;
                rightB = obj2.Zone.TopRightPos.x;
                topB = obj2.Zone.TopRightPos.y;
                bottomB = obj2.Zone.BottomLeftPos.y;
                //If any of the sides from A are outside of B
                if( bottomA <= topB )
                {
                    return false;
                }

                if( topA >= bottomB )
                {
                    return false;
                }

                if( rightA <= leftB )
                {
                    return false;
                }

                if( leftA >= rightB )
                {
                    return false;
                }

                //If none of the sides from A are outside B
                return true;
                
            },
            ZoneToCreepCollisionCheck:function(obj1, Creep) {
                if (Creep.y <= obj1.Zone.TopLeftPos.y-2) {
                    return false;
                }

                if (Creep.y >= obj1.Zone.BottomLeftPos.y+2) {
                    return false;
                }

                if (Creep.x >= obj1.Zone.BottomRightPos.x+2) {
                    return false;
                }

                if (Creep.x <= obj1.Zone.TopLeftPos.x-2) {
                    return false;
                }
                return true;                
            },
        },
    },
    Groups: {
        InitGroupZones:function() {
            for (let key in TState.CreepGroups) {
                for (let i = 0; i < TState.CreepGroups[key].length; i++) {
                    TState.Groups.InitGroupZonePosition(TState.CreepGroups[key][i]);
                }                
            }
        },
        InitGroupZonePosition:function(Group) {
            //harvester_group,defense_group,attack_group,build_group,capture_group
            switch (Group.Type) {
                case "harvester_group":                    
                    TState.Groups.InitHarvesterGroupZonePosition(Group);
                    break;
                case "attack_group":
                    TState.Groups.InitAttackGroupZonePosition(Group);
                    break;
                case "defense_group":
                    TState.Groups.InitDefenseGroupZonePosition(Group);
                    //TODO://
                    break;
                case "build_group":
                    //TODO://
                    break;
                case "capture_group":
                    //TODO://
                    break;

            }
        },
        InitHarvesterGroupZonePosition:function(Group) {      
            Group.Zone.CenterPos.x = TState.Spawns[0].x;
            Group.Zone.CenterPos.y = TState.Spawns[0].y;
            Group.Zone.TopLeftPos.x= TState.Spawns[0].x-TState.ZoneOffsets.harvester_group;
            Group.Zone.TopLeftPos.y= TState.Spawns[0].y-TState.ZoneOffsets.harvester_group;
            Group.Zone.TopRightPos.x= TState.Spawns[0].x+TState.ZoneOffsets.harvester_group;
            Group.Zone.TopRightPos.y= TState.Spawns[0].y-TState.ZoneOffsets.harvester_group;
            Group.Zone.BottomLeftPos.x= TState.Spawns[0].x-TState.ZoneOffsets.harvester_group;
            Group.Zone.BottomLeftPos.y= TState.Spawns[0].y+TState.ZoneOffsets.harvester_group;
            Group.Zone.BottomRightPos.x=TState.Spawns[0].x+TState.ZoneOffsets.harvester_group;
            Group.Zone.BottomRightPos.y=TState.Spawns[0].y+TState.ZoneOffsets.harvester_group;
        },
        InitAttackGroupZonePosition:function(Group) {          
            Group.Zone.CenterPos.x = TState.Spawns[0].x;
            Group.Zone.CenterPos.y = TState.Spawns[0].y;
            Group.Zone.TopLeftPos.x= TState.Spawns[0].x-TState.ZoneOffsets.attack_group;
            Group.Zone.TopLeftPos.y= TState.Spawns[0].y-TState.ZoneOffsets.attack_group;
            Group.Zone.TopRightPos.x= TState.Spawns[0].x+TState.ZoneOffsets.attack_group;
            Group.Zone.TopRightPos.y= TState.Spawns[0].y-TState.ZoneOffsets.attack_group;
            Group.Zone.BottomLeftPos.x= TState.Spawns[0].x-TState.ZoneOffsets.attack_group;
            Group.Zone.BottomLeftPos.y= TState.Spawns[0].y+TState.ZoneOffsets.attack_group;
            Group.Zone.BottomRightPos.x=TState.Spawns[0].x+TState.ZoneOffsets.attack_group;
            Group.Zone.BottomRightPos.y=TState.Spawns[0].y+TState.ZoneOffsets.attack_group;
        },
        InitDefenseGroupZonePosition:function(Group) {
            Group.Zone.CenterPos.x = TState.Spawns[0].x;
            Group.Zone.CenterPos.y = TState.Spawns[0].y;
            Group.Zone.TopLeftPos.x= TState.Spawns[0].x-TState.ZoneOffsets.defense_group;
            Group.Zone.TopLeftPos.y= TState.Spawns[0].y-TState.ZoneOffsets.defense_group;
            Group.Zone.TopRightPos.x= TState.Spawns[0].x+TState.ZoneOffsets.defense_group;
            Group.Zone.TopRightPos.y= TState.Spawns[0].y-TState.ZoneOffsets.defense_group;
            Group.Zone.BottomLeftPos.x= TState.Spawns[0].x-TState.ZoneOffsets.defense_group;
            Group.Zone.BottomLeftPos.y= TState.Spawns[0].y+TState.ZoneOffsets.defense_group;
            Group.Zone.BottomRightPos.x=TState.Spawns[0].x+TState.ZoneOffsets.defense_group;
            Group.Zone.BottomRightPos.y=TState.Spawns[0].y+TState.ZoneOffsets.defense_group;
        },
        InitGroupTierCriteria:function () {
            //CreepGroupKey: ["harvester_group", "defense_group", "attack_group", "build_group","capture_group"]
            for (let i = 0; i < TState.TechLevelKeys.length; i++) {                
                if (!TState.GroupTierCriteria[TState.TechLevelKeys[i]]) {
                    TState.GroupTierCriteria[TState.TechLevelKeys[i]] = [];
                }
                switch (TState.TechLevelKeys[i]) {
                    case "TIER0":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 3 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 2,
                            harvester_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            transport_creeps: ("SAS" == TState.GameType) ? 3 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            builder_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 3,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            ranged_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            total_creeps: ("SAS" == TState.GameType) ? 3 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            ranged_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            total_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            melee_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            healer_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };


                    break;
                    case "TIER1":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 2,
                            harvester_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            transport_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            builder_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 3 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 3,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            ranged_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            ranged_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                    break;
                    case "TIER2":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 2,
                            harvester_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            transport_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            builder_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 3 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 3,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            ranged_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            ranged_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                    break;
                    case "TIER3":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 2,
                            harvester_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            transport_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            builder_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 3 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 3,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            ranged_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 5 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            ranged_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                    break;
                    case "TIER4":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 2,
                            harvester_creeps: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            transport_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            builder_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            total_creeps: ("SAS" == TState.GameType) ? 3 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 3,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            ranged_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 10 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            total_creeps: ("SAS" == TState.GameType) ? 4 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            melee_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            ranged_creeps: ("SAS" == TState.GameType) ? 2 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                            healer_creeps: ("SAS" == TState.GameType) ? 1 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_group"] = {
                            total_groups: ("SAS" == TState.GameType) ? 0 : ("CAC" == TState.GameType) ? 0 : ("CTF" == TState.GameType) ? 0 : 0,
                        };
                    break;
                }
                    
            }            
        },
        InitGroups:function () {
            TState.Groups.ScanGroups();
        },
        InitCreepWrappers:function() {
            TState.Groups.ScanGroupsCreepWrappers();
        },
        ScanGroups:function() {         
            for (let i = 0; i < TState.GroupKeys.length; i++) {
                if (!TState.CreepGroups[TState.GroupKeys[i]]) {
                    TState.CreepGroups[TState.GroupKeys[i]] = [];
                }
                if (TState.CreepGroups[TState.GroupKeys[i]].length < TState.GroupTierCriteria[TState.TechLevel][TState.GroupKeys[i]].total_groups) {
                    for (let j = TState.CreepGroups[TState.GroupKeys[i]].length; j < TState.GroupTierCriteria[TState.TechLevel][TState.GroupKeys[i]].total_groups; j++) {
                        let new_group = {
                            ID: TState.GroupKeys[i]+"-"+TState.CreepGroupIdTicker,
                            Type: TState.GroupKeys[i],
                            CurrentGroupLeader: null,
                            GroupIsReady: false,
                            CurrentTask: "",
                            AgroZoneEnemies:[],
                            CreepsWrapper:[],
                            GroupObjectives:[],
                            Zone: {
                                CenterPos:{
                                    x : 0,
                                    y : 0,
                                },
                                TopLeftPos:{
                                    x : 0,
                                    y : 0,
                                },
                                TopRightPos:{
                                    x : 0,
                                    y : 0,
                                },
                                BottomLeftPos:{
                                    x : 0,
                                    y : 0,
                                },
                                BottomRightPos:{
                                    x : 0,
                                    y : 0,
                                },
                            },
                            
                            
                        }                 
                        TState.CreepGroups[TState.GroupKeys[i]].push(new_group);
                        TState.CreepGroupIdTicker++;
                    }
                }
            }
        },
        ScanGroupsCreepWrappers:function () {
            //GroupKeys: ["harvester_group", "defense_group", "attack_group", "build_group","capture_group"],

            for (let i = 0; i < TState.CreepGroups["harvester_group"].length; i++) {
                if (TState.CreepGroups["harvester_group"][i].CreepsWrapper.length == 0) {
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].harvester_group.harvester_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_group"][i].ID,
                            GroupType: "harvester_group",
                            CreepType: "harvester",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["harvester_group"][i].CreepsWrapper.push(Wrapper);
                    }  

                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].harvester_group.transport_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_group"][i].ID,
                            GroupType: "harvester_group",
                            CreepType: "transporter",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["harvester_group"][i].CreepsWrapper.push(Wrapper);
                    }                       

                } else if (TState.CreepGroups["harvester_group"][i].CreepsWrapper.length > 0) {
                    let harvester_total = 0;
                    let transport_total = 0;
                    
                    for (let j = 0; j <TState.CreepGroups["harvester_group"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["harvester_group"][i].CreepsWrapper[j].CreepType == "harvester") {
                            harvester_total++;
                        }
                        if (TState.CreepGroups["harvester_group"][i].CreepsWrapper[j].CreepType == "transporter") {
                            transport_total++;
                        }
                    }

                    for (let j = harvester_total; j < TState.GroupTierCriteria[TState.TechLevel].harvester_group.harvester_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_group"][i].ID,
                            GroupType: "harvester_group",
                            CreepType: "harvester",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["harvester_group"][i].CreepsWrapper.push(Wrapper);
                        
                    }                
                    for (let j = transport_total; j < TState.GroupTierCriteria[TState.TechLevel].harvester_group.transport_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_group"][i].ID,
                            GroupType: "harvester_group",
                            CreepType: "transporter",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["harvester_group"][i].CreepsWrapper.push(Wrapper);
                    }                                                          
                }
            }           
            
            for (let i = 0; i < TState.CreepGroups["build_group"].length; i++) {
                if (TState.CreepGroups["build_group"][i].CreepsWrapper.length == 0) {                        
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].build_group.builder_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["build_group"][i].ID,
                            GroupType: "build_group",
                            CreepType: "builder",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["build_group"][j].CreepsWrapper.push(Wrapper);
                    } 
                } else if (TState.CreepGroups["build_group"][i].CreepsWrapper.length > 0) {
                    let builder_total = 0;
                    let transport_total = 0;
                    for (let j = 0; j <TState.CreepGroups["build_group"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["build_group"][i].CreepsWrapper[j].CreepType == "builder") {
                            builder_total++;
                        }
                    }
                    for (let j = transport_total; j < TState.GroupTierCriteria[TState.TechLevel].build_group.builder_creeps; j++) {
                        let Wrapper = {
                            GroupId: TState.CreepGroups["build_group"][i].ID,
                            GroupType: "build_group",
                            CreepType: "builder",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["build_group"][i].CreepsWrapper.push(Wrapper);
                    }
                              
                }
            }
            
            for (let i = 0; i< TState.CreepGroups["defense_group"].length; i++) {
                if (TState.CreepGroups["defense_group"][i].CreepsWrapper.length == 0) {
                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_group.melee_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_group"][i].ID,
                            GroupType: "defense_group",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["defense_group"][i].CreepsWrapper.push(Wrapper);
                    }

                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_group.ranged_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_group"][i].ID,
                            GroupType: "defense_group",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["defense_group"][i].CreepsWrapper.push(Wrapper);
                    }

                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_group.healer_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_group"][i].ID,
                            GroupType: "defense_group",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["defense_group"][i].CreepsWrapper.push(Wrapper);
                    }



                } else if (TState.CreepGroups["defense_group"][i].CreepsWrapper.length > 0) {
                    let melee_total = 0; 
                    let ranged_total = 0; 
                    let healer_total = 0;
                    for (let j = 0; j < TState.CreepGroups["defense_group"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["defense_group"][i].CreepsWrapper[j].CreepType == "melee") {
                            melee_total++;
                        }
                        if (TState.CreepGroups["defense_group"][i].CreepsWrapper[j].CreepType == "ranged") {
                            ranged_total++;
                        }
                        if (TState.CreepGroups["defense_group"][i].CreepsWrapper[j].CreepType == "healer") {
                            healer_total++;
                        }
                    }


                    for (let j = melee_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_group.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_group"][i].ID,
                            GroupType: "defense_group",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["defense_group"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = ranged_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_group.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_group"][i].ID,
                            GroupType: "defense_group",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["defense_group"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = healer_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_group.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_group"][i].ID,
                            GroupType: "defense_group",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["defense_group"][i].CreepsWrapper.push(Wrapper);
                    }
                }
            }

            for (let i = 0; i < TState.CreepGroups["attack_group"].length; i++) {
                if (TState.CreepGroups["attack_group"][i].CreepsWrapper.length == 0) {
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_group.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_group"][i].ID,
                            GroupType: "attack_group",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["attack_group"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_group.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_group"][i].ID,
                            GroupType: "attack_group",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["attack_group"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_group.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_group"][i].ID,
                            GroupType: "attack_group",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["attack_group"][i].CreepsWrapper.push(Wrapper);
                    }

                } else if (TState.CreepGroups["attack_group"][i].CreepsWrapper.length > 0) {
                    let melee_total = 0;
                    let ranged_total = 0; 
                    let healer_total = 0; 
                    for (let j = 0; j <TState.CreepGroups["attack_group"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["attack_group"][i].CreepsWrapper[j].CreepType == "melee") {
                            melee_total++;
                        }
                        if (TState.CreepGroups["attack_group"][i].CreepsWrapper[j].CreepType == "ranged") {
                            ranged_total++;
                        }
                        if (TState.CreepGroups["attack_group"][i].CreepsWrapper[j].CreepType == "healer") {
                            healer_total++;
                        }
                    }


                    for (let j = melee_total; j < TState.GroupTierCriteria[TState.TechLevel].attack_group.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_group"][j].ID,
                            GroupType: "attack_group",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["attack_group"][j].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = ranged_total; j < TState.GroupTierCriteria[TState.TechLevel].attack_group.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_group"][j].ID,
                            GroupType: "attack_group",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["attack_group"][j].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = healer_total; j < TState.GroupTierCriteria[TState.TechLevel].attack_group.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_group"][j].ID,
                            GroupType: "attack_group",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["attack_group"][j].CreepsWrapper.push(Wrapper);
                    }

                }
            }      
            
            for (let i = 0; i < TState.CreepGroups["capture_group"].length; i++) {
                if (TState.CreepGroups["capture_group"][i].CreepsWrapper.length == 0) {                        
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].capture_group.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["capture_group"][i].ID,
                            GroupType: "capture_group",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["capture_group"][j].CreepsWrapper.push(Wrapper);
                    } 
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].capture_group.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["capture_group"][i].ID,
                            GroupType: "capture_group",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],

                        };
                        TState.CreepGroups["capture_group"][j].CreepsWrapper.push(Wrapper);
                    } 
                } else if (TState.CreepGroups["capture_group"][i].CreepsWrapper.length > 0) {
                    let attacker_total = 0;
                    let healer_total = 0;
                    for (let j = 0; j <TState.CreepGroups["capture_group"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["capture_group"][i].CreepsWrapper[j].CreepType == "melee") {
                            attacker_total++;
                        }
                    }
                    for (let j = 0; j <TState.CreepGroups["capture_group"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["capture_group"][i].CreepsWrapper[j].CreepType == "healer") {
                            healer_total++;
                        }
                    }

                    for (let j = attacker_total; j < TState.GroupTierCriteria[TState.TechLevel].attack_group.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["capture_group"][j].ID,
                            GroupType: "capture_group",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["capture_group"][j].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = healer_total; j < TState.GroupTierCriteria[TState.TechLevel].capture_group.healer_creeps; j++) {
                        let Wrapper = {
                            GroupId: TState.CreepGroups["capture_group"][i].ID,
                            GroupType: "capture_group",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            CurrentPatrolTarget: null,
                            DangerCreepCollision: [],
                            IsGroupLeader: false,
                            IsInGroupZone: false,
                            AgroRect: {                                
                                top_left: 0,  
                                top_right: 0,
                                bot_left: 0, 
                                bot_right: 0,
                                width: 0,
                                height: 0,
                            },
                            CreepObj: null,
                            Objectives: [],
                        };
                        TState.CreepGroups["capture_group"][i].CreepsWrapper.push(Wrapper);
                    }
                              
                }
            }
        },
        RequeueDeadCreep:function (CreepsWrapper) {         
            if (CreepsWrapper.CreepObj != null && !CreepsWrapper.CreepObj.hits && !TState.SpawnQueue.find(ele => ele.ID === CreepsWrapper.ID)) {
                TState.SpawnQueue = TState.SpawnQueue.concat(CreepsWrapper);
            }
           
        },
        ScanGroupLeader:function(Group) {
            if (!Group.CurrentGroupLeader) {
                for (let i = 0; i < Group.CreepsWrapper.length; i++) {
                    if (Group.Type == "attack_group" || Group.Type == "defense_group") {
                        if (Group.CreepsWrapper[i].CreepType == "melee" && Group.CreepsWrapper[i].CreepObj) {
                            Group.CurrentGroupLeader = Group.CreepsWrapper[i].CreepObj;
                        }
                    } else if (Group.Type == "harvester_group" && Group.CreepsWrapper[i].CreepObj) {
                        if (Group.CreepsWrapper[i].CreepType == "harvester" || Group.CreepsWrapper[i].CreepType == "transporter") {
                            Group.CurrentGroupLeader = Group.CreepsWrapper[i].CreepObj;
                        }
                    } else if (Group.Type == "builder_group" && Group.CreepsWrapper[i].CreepObj) {
                        if (Group.CreepsWrapper[i].CreepType == "builder") {
                            Group.CurrentGroupLeader = Group.CreepsWrapper[i].CreepObj;
                        }
                    }
                }                
            } 
        },
        RepositionGroupZone:function(Group) {
            if (Group.CurrentGroupLeader) {
                if (Group.Type == "attack_group") {
                    Group.Zone.CenterPos.x = Group.CurrentGroupLeader.x;
                    Group.Zone.CenterPos.y = Group.CurrentGroupLeader.y;
                    Group.Zone.TopLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.attack_group;
                    Group.Zone.TopLeftPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.attack_group;
                    Group.Zone.TopRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.attack_group;
                    Group.Zone.TopRightPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.attack_group;
                    Group.Zone.BottomLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.attack_group;
                    Group.Zone.BottomLeftPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.attack_group;
                    Group.Zone.BottomRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.attack_group;
                    Group.Zone.BottomRightPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.attack_group;
                } else if (Group.Type == "harvester_group") {
                    Group.Zone.CenterPos.x = Group.CurrentGroupLeader.x;
                    Group.Zone.CenterPos.y = Group.CurrentGroupLeader.y;
                    Group.Zone.TopLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.harvester_group;
                    Group.Zone.TopLeftPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.harvester_group;
                    Group.Zone.TopRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.harvester_group;
                    Group.Zone.TopRightPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.harvester_group;
                    Group.Zone.BottomLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.harvester_group;
                    Group.Zone.BottomLeftPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.harvester_group;
                    Group.Zone.BottomRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.harvester_group;
                    Group.Zone.BottomRightPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.harvester_group;
                } else if (Group.Type == "builder_group") {
                    Group.Zone.CenterPos.x = Group.CurrentGroupLeader.x;
                    Group.Zone.CenterPos.y = Group.CurrentGroupLeader.y;
                    Group.Zone.TopLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.builder_group;
                    Group.Zone.TopLeftPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.builder_group;
                    Group.Zone.TopRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.builder_group;
                    Group.Zone.TopRightPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.builder_group;
                    Group.Zone.BottomLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.builder_group;
                    Group.Zone.BottomLeftPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.builder_group;
                    Group.Zone.BottomRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.builder_group;
                    Group.Zone.BottomRightPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.builder_group;
                } else if (Group.Type == "defense_group") {
                    Group.Zone.CenterPos.x = TState.Spawns[0].x;
                    Group.Zone.CenterPos.y = TState.Spawns[0].y;
                    Group.Zone.TopLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.defense_group;
                    Group.Zone.TopLeftPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.defense_group;
                    Group.Zone.TopRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.defense_group;
                    Group.Zone.TopRightPos.y= Group.Zone.CenterPos.y-TState.ZoneOffsets.defense_group;
                    Group.Zone.BottomLeftPos.x= Group.Zone.CenterPos.x-TState.ZoneOffsets.defense_group;
                    Group.Zone.BottomLeftPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.defense_group;
                    Group.Zone.BottomRightPos.x= Group.Zone.CenterPos.x+TState.ZoneOffsets.defense_group;
                    Group.Zone.BottomRightPos.y= Group.Zone.CenterPos.y+TState.ZoneOffsets.defense_group;
                    TState.visual_debugger.line(Group.Zone.TopLeftPos, Group.Zone.TopRightPos, {color: '#ff0000'});
                    TState.visual_debugger.line(Group.Zone.TopRightPos, Group.Zone.BottomRightPos, {color: '#ff0000'});
                    TState.visual_debugger.line(Group.Zone.BottomRightPos, Group.Zone.BottomLeftPos, {color: '#ff0000'});
                    TState.visual_debugger.line(Group.Zone.BottomLeftPos, Group.Zone.TopLeftPos, {color: '#ff0000'});
                    
                    
                }
            }
        },  
        CheckGroupZoneState:function(Group) {
            let IsGroupReady = true;
            for (let i = 0; i < Group.CreepsWrapper.length; i++) {
                if (!Group.CreepsWrapper[i].CreepObj) {
                    IsGroupReady = false;
                    Group.GroupIsReady = false;
                } else {
                    if (!TState.RunTime.Utils.ZoneToCreepCollisionCheck(Group, Group.CreepsWrapper[i].CreepObj)) {
                        Group.CreepsWrapper[i].IsInGroupZone = false;
                        IsGroupReady = false;
                        Group.GroupIsReady = false;
                    } else {
                        Group.CreepsWrapper[i].IsInGroupZone = true;
                    }
                }
            }
            if (IsGroupReady) {
                Group.GroupIsReady = true;
            }
        },
        CheckGroupEnemyAgroZoneState:function(Group) {
            Group.AgroZoneEnemies = [];
            for (let i = 0; i < TState.EnemyCreeps.length; i++) { 
                if (!TState.EnemyCreeps[i]) {
                    TState.Groups.Creeps.ScanEnemyCreeps();
                    break;
                }
                if (TState.RunTime.Utils.ZoneToCreepCollisionCheck(Group, TState.EnemyCreeps[i])) {
                    Group.AgroZoneEnemies.push(TState.EnemyCreeps[i]);
                }
            }
        },
        Creeps: {
            /*
            let Wrapper = {
                ID: TState.CreepIdTicker++,
                GroupId: TState.CreepGroups["harvester_group"][i].ID,
                GroupType: "harvester_group",
                CreepType: "harvester",
                CurrentTarget : null,
                TargetType : "",
                CurrentStatus: "",
                CurrentCollisions: [],
                DangerCreepCollision: [],
                IsGroupLeader: false,
                AgroRect: {
                    
                    
                    top_left: 0,  
                    top_right: 0,
                    bot_left: 0, 
                    bot_right: 0,
                    width: 0,
                    height: 0,
                },
                CreepObj: null,
                Objectives: [],
    
            };
            */
            /*
                Work: 100,
                Move: 50,
                Carry: 50,
                Attack: 80,
                RangedAttack: 150,
                Heal: 250,
                Tough: 10,
            */
            InitSpecialSNSADVCreep:function() {
    
            },
            InitCreepBodyTierCriteria:function() {
                for (let i = 0; i < TState.TechLevelKeys.length; i++) {                
                    if (!TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]) {
                        TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]] = [];
                    }

                    //TODO: Change values when implementing tier changing.
                    //TODO: ~ TIER2-4 incomplete.
                    switch (TState.TechLevelKeys[i]) {
                        case "TIER0":
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["harvester"] = {
                                work: 2,    //200
                                move: 3,    //150
                                carry: 3,   //150
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["transporter"] = {
                                work: 0,    //0
                                move: 2,    //100
                                carry: 1,   //50
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 150,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["builder"] = {
                                work: 2,    //200
                                move: 4,    //200
                                carry: 2,   //100
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["melee"] = {
                                work: 0,    //0
                                move: 6,    //300
                                carry: 0,   //0
                                attack: 7,  //560
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 5,   //40
                                total: 900,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["ranged"] = {
                                work: 0,    //0
                                move: 6,    //300
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 1,  //150
                                heal: 0,    //0
                                tough: 5,   //50 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["healer"] = {
                                work: 0,    //0
                                move: 6,    //300
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 1,    //250
                                tough: 10,  //100
                                total: 650,
                            };
                            
                        break;
                        case "TIER1": 
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["harvester"] = {
                                work: 4,    //400
                                move: 4,    //200
                                carry: 8,   //400
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 1000,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["transporter"] = {
                                work: 0,    //0
                                move: 8,    //400
                                carry: 12,  //600
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 1000,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["builder"] = {
                                work: 5,    //500
                                move: 4,    //200
                                carry: 6,   //300
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0 
                                total: 1000,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["melee"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 0,   //0
                                attack: 5,  //400
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 40,   //400
                                total: 1000,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["ranged"] = {
                                work: 0,     //0
                                move: 4,     //200
                                carry: 0,    //0
                                attack: 0,   //0
                                ranged: 3,   //450
                                heal: 0,     //0
                                tough: 35,   //350
                                total: 1000,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["healer"] = {
                                work: 0,    //0
                                move: 3,    //150
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 3,    //750
                                tough: 20,  //100
                                total: 1000,
                            };
                        break;
                        case "TIER2":
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["harvester"] = {
                                work: 2,    //200
                                move: 2,    //100
                                carry: 4,   //200
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["transporter"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 6,   //300
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["builder"] = {
                                work: 2,    //200
                                move: 4,    //200
                                carry: 2,   //100
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["melee"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 0,   //0
                                attack: 2,  //160
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 14,   //140
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["ranged"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 1,  //150
                                heal: 0,    //0
                                tough: 15,   //150 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["healer"] = {
                                work: 0,    //0
                                move: 3,    //150
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 1,    //250
                                tough: 10,  //100
                                total: 500,
                            };
                        break;
                        case "TIER3":
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["harvester"] = {
                                work: 2,    //200
                                move: 2,    //100
                                carry: 4,   //200
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["transporter"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 6,   //300
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["builder"] = {
                                work: 2,    //200
                                move: 4,    //200
                                carry: 2,   //100
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["melee"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 0,   //0
                                attack: 2,  //160
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 14,   //140
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["ranged"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 1,  //150
                                heal: 0,    //0
                                tough: 15,   //150 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["healer"] = {
                                work: 0,    //0
                                move: 3,    //150
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 1,    //250
                                tough: 10,  //100
                                total: 500,
                            };
                        break;
                        case "TIER4":
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["harvester"] = {
                                work: 2,    //200
                                move: 2,    //100
                                carry: 4,   //200
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["transporter"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 6,   //300
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["builder"] = {
                                work: 2,    //200
                                move: 4,    //200
                                carry: 2,   //100
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 0,   //0 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["melee"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 0,   //0
                                attack: 2,  //160
                                ranged: 0,  //0
                                heal: 0,    //0
                                tough: 14,   //140
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["ranged"] = {
                                work: 0,    //0
                                move: 4,    //200
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 1,  //150
                                heal: 0,    //0
                                tough: 15,   //150 
                                total: 500,
                            };
                            TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]["healer"] = {
                                work: 0,    //0
                                move: 3,    //150
                                carry: 0,   //0
                                attack: 0,  //0
                                ranged: 0,  //0
                                heal: 1,    //250
                                tough: 10,  //100
                                total: 500,
                            };
                        break;
                    }
                }
            },
            ScanEnemyCreeps:function () {
                TState.EnemyCreeps = getObjectsByPrototype(Creep).filter(i => !i.my);
            },
        }, 
    },
    Structures: {
        InitEnergySupply:function() {
            TState.Structures.ScanEnergySupply();
        },
        ScanEnergySupply:function() {
            let energy = 0;
            for (let i = 0; i < TState.Spawns.length; i++) {
                energy += TState.Spawns[i].store.getUsedCapacity([RESOURCE_ENERGY]);
            }

            if (TState.Extensions && TState.Extensions.length > 0) {
                for (let j = 0; j < TState.Extensions.length; j++) {
                    energy += TState.Extensions[j].store.getUsedCapacity([RESOURCE_ENERGY]);
                }
            }
            TState.AvailableEnergy = energy;
        },
        Spawn: {
            InitSpawn:function() {
                TState.Spawns = [];
                TState.Spawns = TState.Spawns.concat(getObjectsByPrototype(StructureSpawn).find(i => i.my));
            },
            InitEnemySpawn:function() {
                TState.EnemySpawns = [];
                TState.EnemySpawns = TState.EnemySpawns.concat(getObjectsByPrototype(StructureSpawn).find(i => !i.my));
            },
            InitSpawnQueue:function () {
                //CreepGroupKeys: ["harvester_group", "defense_group", "attack_group", "build_group","capture_group"],
                
                for (let i = 0; i < TState.CreepGroups["harvester_group"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["harvester_group"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["harvester_group"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["build_group"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["build_group"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["build_group"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["defense_group"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["defense_group"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["defense_group"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["attack_group"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["attack_group"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["attack_group"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["capture_group"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["capture_group"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["capture_group"][i].CreepsWrapper[j])
                    }
                }
            },
            PollSpawnQueue:function() {
                let body = [];
                              
                if (TState.Structures.Spawn.CanSpawnCreep()) {
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].tough; i++) {
                        body.push(TOUGH);
                    }
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].move; i++) {
                        body.push(MOVE);
                    }
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].work; i++) {
                        body.push(WORK);
                    }
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].carry; i++) {
                        body.push(CARRY);
                    }
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].attack; i++) {
                        body.push(ATTACK);
                    }
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].ranged; i++) {
                        body.push(RANGED_ATTACK);
                    }
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].heal; i++) {
                        body.push(HEAL);
                    }

                    //CreepGroupKeys: ["harvester_group", "defense_group", "attack_group", "build_group","capture_group"],

                    for (let i = 0; i < TState.CreepGroups[TState.SpawnQueue[0].GroupType].length; i++) {
                        if (TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].ID == TState.SpawnQueue[0].GroupId) {
                            for (let j = 0; j <TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].CreepsWrapper.length; j++) {                                
                                if (TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].CreepsWrapper[j].ID == TState.SpawnQueue[0].ID && TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].CreepsWrapper[j].CreepType == TState.SpawnQueue[0].CreepType) {                                    
                                    for (let k = 0; k < TState.Spawns.length; k++) {
                                            let creep_spawn = TState.Spawns[k].spawnCreep(body);
                                            if (creep_spawn.error == -4) {
                                                //console.log("SpawnDelayActive: "+creep_spawn.error);
                                                TState.SpawnDelay = true;
                                                return;
                                            } 
                                            if (creep_spawn.error) {
                                                //console.log(creep_spawn.error);
                                                TState.SpawnDelay = true;
                                                return;
                                            }
                                            TState.AvailableEnergy -= TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].total;
                                            TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].CreepsWrapper[j].CreepObj = creep_spawn.object;
                                            TState.SpawnQueue.splice(0,1);
                                            return;
                                        
                                    }
                                    
                                }
                            }
                        }
                    }

                } else {                    
                    //console.log("Not enough energy");
                    TState.SpawnDelay = true;
                    
                }
                
            },
            CanSpawnCreep:function () {
                TState.Structures.ScanEnergySupply();
                if (TState.SpawnQueue.length > 0) {
                    switch (TState.SpawnQueue[0].CreepType) {
                        
                        case "harvester":
                            if (TState.AvailableEnergy >= TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].total) {
                                return true;
                            }
                        break;
                        case "transporter":
                            if (TState.AvailableEnergy >= TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].total) {
                                return true;
                            }
                        break;
                        case "builder":
                            if (TState.AvailableEnergy >= TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].total) {
                                return true; 
                            }
                        break;
                        case "melee":
                            if (TState.AvailableEnergy >= TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].total) {
                                return true;
                            }
                        break;
                        case "ranged":
                            if (TState.AvailableEnergy >= TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].total) {
                                return true;
                            }
                        break;
                        case "healer":
                            if (TState.AvailableEnergy >= TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].total) {
                                return true;
                            }
                        break;
                    }

                }
                return false;
            },
        },
        Extensions: {
            InitExtensions:function() {
                TState.Extensions = utils.getObjectsByPrototype(StructureExtension).find(i => i.my);
            },
        },
        Containers: {
            InitContainers:function() {
                let room_containers = utils.getObjectsByPrototype(StructureContainer);
                TState.Containers = room_containers.filter(c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 0);

            },

            ScanContainers:function() {
                let room_containers = utils.getObjectsByPrototype(StructureContainer);
                TState.Containers = room_containers.filter(c => c.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
            }
        }
    },
    Resources: {
        InitRoomSources:function() {
            TState.RoomSources = [];
            TState.RoomSources = TState.RoomSources.concat(utils.getObjectsByPrototype(Source));
        },
    },
};
export function loop() {
    if (!TState.Preflight) {
        TState.Init.InitMain();       
    }    
    if (TState.SpawnDelay) {
        if (getTicks() % 5 == 0) {
            TState.SpawnDelay = false;
            TState.Structures.Spawn.PollSpawnQueue();
        }
    } else {
        TState.Structures.Spawn.PollSpawnQueue();
    }    
    if (TState.NeedContainerScan) {
        TState.Structures.Containers.ScanContainers();
        TState.NeedContainerScan = false;
    }
    if (getTicks() % 30 == 0) {
        TState.RunTime.StateUpdate();
    }
    TState.RunTime.RunGroups();    
}