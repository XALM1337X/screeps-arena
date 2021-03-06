import { getObjectsByPrototype } from '/game/utils';
import { Creep, StructureSpawn, Source, StructureExtension } from '/game/prototypes';
import { OK, ERR_NOT_IN_RANGE, MOVE, WORK, CARRY, ATTACK, RANGED_ATTACK, HEAL, TOUGH, RESOURCE_ENERGY, TOP, TOP_RIGHT, BOTTOM, BOTTOM_RIGHT, RIGHT, TOP_LEFT, BOTTOM_LEFT, LEFT} from '/game/constants';
import { utils, arenaInfo } from '/game';
import { getTicks } from '/game/utils';

let TState = {
    IsTutorial: false,
    SpecialBitch: null,

    SpawnDelay: false,
    Preflight: false,
    AvailableEnergy: 0,
    CreepGroupIdTicker: 0,
    CreepIdTicker: 0,

    Objectives: [],
    Spawns:  [],
    CreepGroups: [],
    Structures: [],
    ConstructionSites: [],
    Towers: [],
    WorldContainers: [],
    WorldResources: [],
    ModuleReinitList: [],
    Extensions: [],
    Containers: [],

    SpawnQueue: [],
    TasksQueue: [],

    GameType: "",    
    TechLevel: "TIER0", 
    TechLevelKeys: ["TIER0", "TIER1", "TIER2", "TIER3", "TIER4"],
    GameType: ["Capture the Flag","Collect and Control","Spawn and Swamp"],
    CreepGroupKeys: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
    RoomSources: [],


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


    EnemyCreeps:[],
    EnemyStructures:[],
    EnemyTowers:[],
    EnemySpawns:[],
    ExitStatus: 0,

    TestFlag : false,

    Init:function() {

        TState.InitGameType();

        if (TState.GameType == "Spawn and Swamp") {            
            if (arenaInfo.level == 1) {
                TState.InitSASSTD();
            } else if (arenaInfo.level > 1) {
                TState.InitSASADV();
            }
        } else if (TState.GameType == "Collect and Control") {
            if (arenaInfo.level == 1) {
                TState.InitCACSTD();
            } else if (arenaInfo.level > 1) {
                TState.InitCACADV();
            }
        } else if (TState.GameType == "Capture the Flag") {
            if (arenaInfo.level == 1) {
                TState.InitCTFSTD();
            } else if (arenaInfo.level > 1) {
                TState.InitCTFADV();
            }
        } else {
            TState.InitTutorial();
        }
        TState.Preflight = true;
    },
    InitGameType:function () {
        TState.GameType = arenaInfo.name;
    },
    InitCTFSTD:function() {
        console.log("TBA.");
    },
    InitCTFADV:function() {
        console.log("TBA.");
    },
    InitCACSTD:function() {
        console.log("TBA.");
    },
    InitCACADV:function() {
        console.log("TBA.");
    },
    InitSASSTD:function() {
        TState.Structures.Spawn.InitSpawn();
        TState.Structures.InitEnergySupply();
        TState.Structures.Containers.InitContainers();
        TState.Creeps.InitCreepBodyTierCriteria();
        TState.Groups.InitGroupTierCriteria();
        TState.Groups.InitGroups();
        TState.Groups.InitCreepWrappers();
        TState.Structures.Spawn.InitSpawnQueue();
    },
    InitSASADV:function() {
        TState.Resources.InitRoomSources();
        TState.Structures.InitEnergySupply();
        TState.Creeps.InitCreepBodyTierCriteria();
        TState.Creeps.InitSpecialSNSADVCreep();
        TState.Groups.InitGroupTierCriteria();
        TState.Groups.InitGroups();
        TState.Groups.InitCreepWrappers();
        TState.Structures.Spawn.InitSpawnQueue();
    },
    InitTutorial:function() {
        TState.IsTutorial = true
        TState.Resources.InitRoomSources();
        TState.Structures.Spawn.InitSpawn();
        TState.Structures.InitEnergySupply();
        TState.Creeps.InitCreepBodyTierCriteria();
        TState.Groups.InitGroupTierCriteria();
        TState.Groups.InitGroups();
        TState.Groups.InitCreepWrappers();
        TState.Structures.Spawn.InitSpawnQueue();
        TState.RunTime.ScanEnemyCreeps();
    },


    RunTime : {
        ScanEnemyCreeps:function () {
            TState.EnemyCreeps = getObjectsByPrototype(Creep).find(i => !i.my);
        },
        RunCreepGroupsTutorial:function () {
            for (let key in TState.CreepGroups) {
                for(let i = 0; i < TState.CreepGroups[key].length; i++) {
                    for(let j = 0; j < TState.CreepGroups[key][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "harvester" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                TState.RunTime.RunHarvester(TState.CreepGroups[key][i].CreepsWrapper[j])
                                
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "transporter" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                console.log(TState.CreepGroups[key][i].CreepsWrapper[j]);
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "builder" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                console.log(TState.CreepGroups[key][i].CreepsWrapper[j]);
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "melee" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                TState.RunTime.RunAttacker(TState.CreepGroups[key][i].CreepsWrapper[j])
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "ranged" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                console.log(TState.CreepGroups[key][i].CreepsWrapper[j]);
                            }
                        } else if (TState.CreepGroups[key][i].CreepsWrapper[j].CreepType == "healer" && TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj) {
                            if(TState.CreepGroups[key][i].CreepsWrapper[j].CreepObj.id) {
                                TState.RunTime.RunHealer(TState.CreepGroups[key][i].CreepsWrapper[j])
                            }
                        }
                    }
                }
            }
        },

            /*
            CREEPWRAPPER
            {
                ID: 0,
                GroupId: 'harvester_groups-0',
                GroupType: 'harvester_groups',
                CreepType: 'harvester',
                CurrentTarget: null,
                TargetType : "",
                CurrentStatus: "",
                CreepObj: Creep {
                  id: 17,
                  x: 51,
                  y: 44,
                  ticksToDecay: undefined,
                  hits: 800,
                  hitsMax: 800,
                  my: true,
                  fatigue: 0,
                  body: [
                    { type: 'move', hits: 100 },
                    { type: 'move', hits: 100 },
                    { type: 'work', hits: 100 },
                    { type: 'work', hits: 100 },
                    { type: 'carry', hits: 100 },
                    { type: 'carry', hits: 100 },
                    { type: 'carry', hits: 100 },
                    { type: 'carry', hits: 100 }
                  ],
                  store: Store {}
                },
                Objectives: []
              }
              */

        RunAttacker:function(CreepWrapper) {
            
        },

        RunHealer:function(CreepWrapper) {
            //console.log(CreepWrapper);
        },

        RunHarvester:function(CreepWrapper) {

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
                            if (TState.RunTime.getDistance(CreepWrapper.CreepObj, TState.RoomSources[i]) < closest) {
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

        perimiterCheck:function() {

        },

        getDistance:function(obj1, obj2) {
            let ydiff = obj2.y - obj1.y;
            let xdiff = obj2.x - obj1.x;
            return Math.sqrt((ydiff*ydiff)+(xdiff*xdiff))
        }

    },



    //TODO: This will be checked in loop periodically.
    CheckTechUpgradeState:function() {
        //Will check how many groups we have. 
        //How many resources we have.
        //And how long its been since "Max tech groups" numbers reached
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

            if (TState.Extensions && TState.ExitStatus.length > 0) {
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
            InitSpawnQueue:function () {
                //CreepGroupKeys: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
                
                for (let i = 0; i < TState.CreepGroups["harvester_groups"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["harvester_groups"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["harvester_groups"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["build_groups"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["build_groups"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["build_groups"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["defense_groups"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["defense_groups"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["defense_groups"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["attack_groups"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["attack_groups"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["attack_groups"][i].CreepsWrapper[j])
                    }
                }
                for (let i = 0; i < TState.CreepGroups["capture_groups"].length; i++) {
                    for (let j = 0; j < TState.CreepGroups["capture_groups"][i].CreepsWrapper.length; j++) {
                        TState.SpawnQueue = TState.SpawnQueue.concat(TState.CreepGroups["capture_groups"][i].CreepsWrapper[j])
                    }
                }
            },
            PollSpawnQueue:function() {
                let body = [];
                              
                if (TState.Structures.Spawn.CanSpawnCreep()) {
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
                    for(let i = 0; i < TState.CreepBodyTierCriteria[TState.TechLevel][TState.SpawnQueue[0].CreepType].tough; i++) {
                        body.push(TOUGH);
                    }
                    //CreepGroupKeys: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],

                    for (let i = 0; i < TState.CreepGroups[TState.SpawnQueue[0].GroupType].length; i++) {
                        if (TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].ID == TState.SpawnQueue[0].GroupId) {
                            for (let j = 0; j <TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].CreepsWrapper.length; j++) {                                
                                if (TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].CreepsWrapper[j].ID == TState.SpawnQueue[0].ID && TState.CreepGroups[TState.SpawnQueue[0].GroupType][i].CreepsWrapper[j].CreepType == TState.SpawnQueue[0].CreepType) {                                    
                                    for (let k = 0; k < TState.Spawns.length; k++) {
                                            let creep_spawn = TState.Spawns[k].spawnCreep(body);
                                            if (creep_spawn.error == -4) {
                                                console.log("SpawnDelayActive: "+creep_spawn.error);
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
                TState.Containers = utils.getObjectsByPrototype(StructureContainer);
            }
        }
    },
    
    Creeps: {
        InitSpecialSNSADVCreep:function() {

        },
        InitCreepBodyTierCriteria:function() {
            for (let i = 0; i < TState.TechLevelKeys.length; i++) {                
                if (!TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]]) {
                    TState.CreepBodyTierCriteria[TState.TechLevelKeys[i]] = [];
                }
                /*
                    Work: 100,
                    Move: 50,
                    Carry: 50,
                    Attack: 80,
                    RangedAttack: 150,
                    Heal: 250,
                    Tough: 10,
                */
                //TODO: Change values when implementing tier changing.
                //TODO: ~ TIER2-4 incomplete.
                switch (TState.TechLevelKeys[i]) {
                    case "TIER0":
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
    },

    Resources: {
        InitRoomSources:function() {
            TState.RoomSources = [];
            TState.RoomSources = TState.RoomSources.concat(utils.getObjectsByPrototype(Source));
        },
    },

    Groups: {
        InitGroupTierCriteria:function () {
            //CreepGroupKey: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"]

            if (TState.IsTutorial) {
                if (!TState.GroupTierCriteria["TIER0"]) {
                    TState.GroupTierCriteria["TIER0"] = [];
                }
                TState.GroupTierCriteria["TIER0"]["harvester_groups"] = {
                    total_groups: 1,
                    total_creeps: 0,
                    harvester_creeps: 1,
                    transport_creeps: 0,
                };
                TState.GroupTierCriteria["TIER0"]["build_groups"] = {
                    total_groups: 0,
                    total_creeps: 0,
                    builder_creeps: 0,
                };
                TState.GroupTierCriteria["TIER0"]["defense_groups"] = {
                    total_groups: 1,
                    total_creeps: 2,
                    melee_creeps: 1,
                    ranged_creeps: 0,
                    healer_creeps: 1,
                };
                TState.GroupTierCriteria["TIER0"]["attack_groups"] = {
                    total_groups: 0,
                    total_creeps: 0,
                    melee_creeps: 0,
                    ranged_creeps: 0,
                    healer_creeps: 0,
                };
                TState.GroupTierCriteria["TIER0"]["capture_groups"] = {
                    total_groups: 0,
                };
            } else {
                for (let i = 0; i < TState.TechLevelKeys.length; i++) {                
                    if (!TState.GroupTierCriteria[TState.TechLevelKeys[i]]) {
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]] = [];
                    }
                    switch (TState.TechLevelKeys[i]) {
                        case "TIER0":
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 2,
                                harvester_creeps: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                transport_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                builder_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 3 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 3,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
    
    
                        break;
                        case "TIER1":
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 2,
                                harvester_creeps: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                transport_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                builder_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 3 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 3,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                        break;
                        case "TIER2":
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 2,
                                harvester_creeps: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                transport_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                builder_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 3 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 3,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                        break;
                        case "TIER3":
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 2,
                                harvester_creeps: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                transport_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                builder_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 3 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 3,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 5 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                        break;
                        case "TIER4":
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 2,
                                harvester_creeps: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                transport_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                builder_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 3 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 3,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 1,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 10 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                total_creeps: ("Spawn and Swamp" == TState.GameType) ? 4 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                melee_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                ranged_creeps: ("Spawn and Swamp" == TState.GameType) ? 2 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                                healer_creeps: ("Spawn and Swamp" == TState.GameType) ? 1 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                            TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                                total_groups: ("Spawn and Swamp" == TState.GameType) ? 0 : ("Collect and Control" == TState.GameType) ? 0 : ("Capture the Flag" == TState.GameType) ? 0 : 0,
                            };
                        break;
                    }
                      
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

            if (!TState.CreepGroups["harvester_groups"]) {
                TState.CreepGroups["harvester_groups"] = [];
            }
                       
                if (TState.CreepGroups["harvester_groups"].length < TState.GroupTierCriteria[TState.TechLevel]["harvester_groups"].total_groups) {
                    for (let j = TState.CreepGroups["harvester_groups"].length; j < TState.GroupTierCriteria[TState.TechLevel]["harvester_groups"].total_groups; j++) {
                        let new_group = {
                            ID: "harvester_groups"+"-"+TState.CreepGroupIdTicker,
                            CreepsWrapper:[],
                            GroupObjectives:[],
                            
                        }                 
                        TState.CreepGroups["harvester_groups"].push(new_group);
                        TState.CreepGroupIdTicker++;
                    }
                }
            

            if (!TState.CreepGroups["build_groups"]) {
                TState.CreepGroups["build_groups"] = [];
            }

            if (TState.CreepGroups["build_groups"].length < TState.GroupTierCriteria[TState.TechLevel]["build_groups"].total_groups) {
                for (let j = TState.CreepGroups["build_groups"].length; j < TState.GroupTierCriteria[TState.TechLevel]["build_groups"].total_groups; j++) {
                    let new_group = {
                        ID: "build_groups"+"-"+TState.CreepGroupIdTicker,
                        CreepsWrapper:[],
                        GroupObjectives:[],
                        
                    }                 
                    TState.CreepGroups["build_groups"].push(new_group);
                    TState.CreepGroupIdTicker++;
                }
            }

            if (!TState.CreepGroups["defense_groups"]) {
                TState.CreepGroups["defense_groups"] = [];
            }

            if (TState.CreepGroups["defense_groups"].length < TState.GroupTierCriteria[TState.TechLevel]["defense_groups"].total_groups) {
                for (let i = TState.CreepGroups["defense_groups"].length; i < TState.GroupTierCriteria[TState.TechLevel]["defense_groups"].total_groups; i++) {
                    let new_group = {
                        ID: "defense_groups"+"-"+TState.CreepGroupIdTicker,
                        CreepsWrapper:[],
                        GroupObjectives:[],
                    }                 
                    TState.CreepGroups["defense_groups"].push(new_group);
                    TState.CreepGroupIdTicker++;
                }
            }

            if (!TState.CreepGroups["attack_groups"]) {
                TState.CreepGroups["attack_groups"] = [];
            }
            
            if (TState.CreepGroups["attack_groups"].length < TState.GroupTierCriteria[TState.TechLevel]["attack_groups"].total_groups) {
                for (let i = TState.CreepGroups["attack_groups"].length; i < TState.GroupTierCriteria[TState.TechLevel]["attack_groups"].total_groups; i++) {
                    let new_group = {
                        ID: "attack_groups"+"-"+TState.CreepGroupIdTicker,
                        CreepsWrapper:[],
                        GroupObjectives:[],
                    }                 
                    TState.CreepGroups["attack_groups"].push(new_group);
                    TState.CreepGroupIdTicker++;
                }
            }  

            if (!TState.CreepGroups["capture_groups"]) {
                TState.CreepGroups["capture_groups"] = [];
            }
            
            if (TState.CreepGroups["capture_groups"].length < TState.GroupTierCriteria[TState.TechLevel]["capture_groups"].total_groups) {
                for (let i = TState.CreepGroups["capture_groups"].length; i < TState.GroupTierCriteria[TState.TechLevel]["capture_groups"].total_groups; i++) {
                    let new_group = {
                        ID: "capture_groups"+"-"+TState.CreepGroupIdTicker,
                        CreepsWrapper:[],
                        GroupObjectives:[],
                    }                 
                    TState.CreepGroups["capture_groups"].push(new_group);
                    TState.CreepGroupIdTicker++;
                }
            }
        },

        ScanGroupsCreepWrappers:function () {
            //CreepGroupKeys: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
            //TODO Add capture groups

            for (let i = 0; i < TState.CreepGroups["harvester_groups"].length; i++) {
                if (TState.CreepGroups["harvester_groups"][i].CreepsWrapper.length == 0) {

                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].harvester_groups.harvester_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_groups"][i].ID,
                            GroupType: "harvester_groups",
                            CreepType: "harvester",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["harvester_groups"][i].CreepsWrapper.push(Wrapper);
                    }  

                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].harvester_groups.transport_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_groups"][i].ID,
                            GroupType: "harvester_groups",
                            CreepType: "transporter",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["harvester_groups"][i].CreepsWrapper.push(Wrapper);
                    }                       

                } else if (TState.CreepGroups["harvester_groups"][i].CreepsWrapper.length > 0) {
                    let harvester_total = 0;
                    let transport_total = 0;
                    
                    for (let j = 0; j <TState.CreepGroups["harvester_groups"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["harvester_groups"][i].CreepsWrapper[j].CreepType == "harvester") {
                            harvester_total++;
                        }
                        if (TState.CreepGroups["harvester_groups"][i].CreepsWrapper[j].CreepType == "transporter") {
                            transport_total++;
                        }
                    }

                    for (let j = harvester_total; j < TState.GroupTierCriteria[TState.TechLevel].harvester_groups.harvester_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_groups"][i].ID,
                            GroupType: "harvester_groups",
                            CreepType: "harvester",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["harvester_groups"][i].CreepsWrapper.push(Wrapper);
                        
                    }                
                    for (let j = transport_total; j < TState.GroupTierCriteria[TState.TechLevel].harvester_groups.transport_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_groups"][i].ID,
                            GroupType: "harvester_groups",
                            CreepType: "transporter",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["harvester_groups"][i].CreepsWrapper.push(Wrapper);
                    }                                                          
                }
            }           
            
            for (let i =0; i < TState.CreepGroups["build_groups"].length; i++) {
                if (TState.CreepGroups["build_groups"][i].CreepsWrapper.length == 0) {                        
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].build_groups.builder_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["build_groups"][i].ID,
                            GroupType: "build_groups",
                            CreepType: "builder",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["build_groups"][j].CreepsWrapper.push(Wrapper);
                    } 
                } else if (TState.CreepGroups["build_groups"][i].CreepsWrapper.length > 0) {
                    let builder_total = 0;
                    for (let j = 0; j <TState.CreepGroups["build_groups"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["build_groups"][i].CreepsWrapper[j].CreepType == "builder") {
                            builder_total++;
                        }
                    }
                    for (let j = transport_total; j < TState.GroupTierCriteria[TState.TechLevel].build_groups.builder_creeps; j++) {
                        let Wrapper = {
                            GroupId: TState.CreepGroups["build_groups"][i].ID,
                            GroupType: "build_groups",
                            CreepType: "builder",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["build_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                              
                }
            }
            
            for (let i =0; i< TState.CreepGroups["defense_groups"].length; i++) {
                if (TState.CreepGroups["defense_groups"][i].CreepsWrapper.length == 0) {

                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_groups.melee_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            GroupType: "defense_groups",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }

                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_groups.ranged_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            GroupType: "defense_groups",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }

                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_groups.healer_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            GroupType: "defense_groups",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }



                } else if (TState.CreepGroups["defense_groups"][i].CreepsWrapper.length > 0) {
                    let melee_total = 0; 
                    let ranged_total = 0; 
                    let healer_total = 0;
                    for (let j = 0; j < TState.CreepGroups["defense_groups"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["defense_groups"][i].CreepsWrapper[j].CreepType == "melee") {
                            melee_total++;
                        }
                        if (TState.CreepGroups["defense_groups"][i].CreepsWrapper[j].CreepType == "ranged") {
                            ranged_total++;
                        }
                        if (TState.CreepGroups["defense_groups"][i].CreepsWrapper[j].CreepType == "healer") {
                            healer_total++;
                        }
                    }


                    for (let j = melee_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_groups.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            GroupType: "defense_groups",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = ranged_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_groups.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            GroupType: "defense_groups",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = healer_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_groups.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            GroupType: "defense_groups",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                }
            }

            for (let i =0; i < TState.CreepGroups["attack_groups"].length; i++) {
                if (TState.CreepGroups["attack_groups"][i].CreepsWrapper.length == 0) {
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][i].ID,
                            GroupType: "attack_groups",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["attack_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][i].ID,
                            GroupType: "attack_groups",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["attack_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][i].ID,
                            GroupType: "attack_groups",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["attack_groups"][i].CreepsWrapper.push(Wrapper);
                    }

                } else if (TState.CreepGroups["attack_groups"][i].CreepsWrapper.length > 0) {
                    let melee_total = 0;
                    let ranged_total = 0; 
                    let healer_total = 0; 
                    for (let j = 0; j <TState.CreepGroups["attack_groups"][i].CreepsWrapper.length; j++) {
                        if (TState.CreepGroups["attack_groups"][i].CreepsWrapper[j].CreepType == "melee") {
                            melee_total++;
                        }
                        if (TState.CreepGroups["attack_groups"][i].CreepsWrapper[j].CreepType == "ranged") {
                            ranged_total++;
                        }
                        if (TState.CreepGroups["attack_groups"][i].CreepsWrapper[j].CreepType == "healer") {
                            healer_total++;
                        }
                    }


                    for (let j = melee_total; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][j].ID,
                            GroupType: "attack_groups",
                            CreepType: "melee",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["attack_groups"][j].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = ranged_total; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][j].ID,
                            GroupType: "attack_groups",
                            CreepType: "ranged",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["attack_groups"][j].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = healer_total; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][j].ID,
                            GroupType: "attack_groups",
                            CreepType: "healer",
                            CurrentTarget : null,
                            TargetType : "",
                            CurrentStatus: "",
                            CurrentCollisions: [],
                            DangerCreepCollision: [],
                            AgroRect: {
                                center_x: 0,
                                center_y: 0,
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
                        TState.CreepGroups["attack_groups"][j].CreepsWrapper.push(Wrapper);
                    }

                }
            }            
        },    
    },
};


export function loop() {
    //TODO: Trigger Inits based off error flags thrown.
    if (!TState.Preflight) {
        TState.Init();       
    }    
    
    if (TState.SpawnDelay) {
        if (getTicks() % 20 == 0) {
            TState.SpawnDelay = false;
            TState.Structures.Spawn.PollSpawnQueue();
        }
    } else {
        TState.Structures.Spawn.PollSpawnQueue();
    }
    


    if (TState.GameType == "Spawn and Swamp") {            
        if (arenaInfo.level == 1) {
            
        } else if (arenaInfo.level > 1) {
            
        }
    } else if (TState.GameType == "Collect and Control") {
        if (arenaInfo.level == 1) {
            
        } else if (arenaInfo.level > 1) {
            
        }
    } else if (TState.GameType == "Capture the Flag") {
        if (arenaInfo.level == 1) {
            
        } else if (arenaInfo.level > 1) {
            
        }
    } else {
        if (!TState.TestFlag) {
            TState.RunTime.RunCreepGroupsTutorial();
            //TState.TestFlag = true;
        }
    }
    

}


//TESTING SNIPPETS
/*
    //CreepGroup Tests
    for (let i = 0; i < TState.CreepGroups["harvester_groups"].length; i++) {
        console.log(TState.CreepGroups["harvester_groups"][i]);
    }
    //console.log(TState.CreepGroups["build_groups"].length);
    for (let i = 0; i < TState.CreepGroups["build_groups"].length; i++) {
        console.log(TState.CreepGroups["build_groups"][i]);
    }
    //console.log(TState.CreepGroups["defense_groups"].length);
    for (let i = 0; i < TState.CreepGroups["defense_groups"].length; i++) {
        console.log(TState.CreepGroups["defense_groups"][i]);
    }
    //console.log(TState.CreepGroups["attack_groups"].length);
    for (let i = 0; i < TState.CreepGroups["attack_groups"].length; i++) {
        console.log(TState.CreepGroups["attack_groups"][i]);
    }


    //Group tier Criteria tests
    //console.log(TState.GroupTierCriteria[TState.TechLevel]["harvester_groups"]);
    //console.log(TState.GroupTierCriteria[TState.TechLevel]["build_groups"]);
    //console.log(TState.GroupTierCriteria[TState.TechLevel]["defense_groups"]);
    //console.log(TState.GroupTierCriteria[TState.TechLevel]["attack_groups"]);


*/
        
