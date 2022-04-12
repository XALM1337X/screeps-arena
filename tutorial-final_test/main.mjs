import { getObjectsByPrototype } from '/game/utils';
import { Creep, StructureSpawn, Source, StructureExtension } from '/game/prototypes';
import { ERR_NOT_IN_RANGE, ATTACK, RANGED_ATTACK, HEAL, RESOURCE_ENERGY } from '/game/constants';
import { utils } from '/game';
import { getTicks } from '/game/utils';

let TState = {
    ScanLock: false,
    Preflight: false,
    Objectives: [],
    Spawns:  [],
    CreepGroups: [],
    CreepGroupIdTicker: 0,
    CreepIdTicker: 0,
    Structures: [],
    ConstructionSites: [],
    Towers: [],
    WorldContainers: [],
    WorldResources: [],
    ModuleReinitList: [],
    SpawnQueue: [],
    Extensions: [],

    GameType: "",    
    TechLevel: "TIER0", 
    TechLevelKeys: ["TIER0", "TIER1", "TIER2", "TIER3", "TIER4"],
    AvailableEnergy: 0,
    GameType: ["ctf","cnc","sns"],
    CreepGroupKey: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
    RoomSources: [],
    GroupTierCriteria: {
        Tier0: {
            harvester_groups: {
                total_groups: 1,
                total_creeps: 4,
                harvester_creeps: 2,
                transport_creeps: 2,

            },
            build_groups: {
                total_groups: 1,
                total_creeps: 1,
                builder_creeps: 1,
            },
            defense_groups: {
                total_groups: 1,
                total_creeps: 3,
                melee_creeps: 1,
                ranged_creeps: 1,
                healer_creeps: 1,
            },
            attack_groups: {
                total_groups: 1,
                total_creeps: 4,
                melee_creeps: 1,
                ranged_creeps: 2,
                healer_creeps: 1,
            }, 
            capture_groups: {
                total_groups: 0,
            },   

        },
        Tier1: {
            harvester_groups: {
                total_groups: 1,
                total_creeps: 4,
                harvester_creeps: 2,
                transport_creeps: 2,

            },
            build_groups: {
                total_groups: 1,
                total_creeps: 1,
                builder_creeps: 1,
            },
            defense_groups: {
                total_groups: 1,
                total_creeps: 3,
                melee_creeps: 1,
                ranged_creeps: 1,
                healer_creeps: 1,
            },
            attack_groups: {
                total_groups: 1,
                total_creeps: 4,
                melee_creeps: 1,
                ranged_creeps: 2,
                healer_creeps: 1,
            },  
            capture_groups: {
                total_groups: 0,
            },   
               
        },
        Tier2: {
            harvester_groups: {
                total_groups: 1,
                total_creeps: 4,
                harvester_creeps: 2,
                transport_creeps: 2,

            },
            build_groups: {
                total_groups: 1,
                total_creeps: 1,
                builder_creeps: 1,
            },
            defense_groups: {
                total_groups: 1,
                total_creeps: 3,
                melee_creeps: 1,
                ranged_creeps: 1,
                healer_creeps: 1,
            },
            attack_groups: {
                total_groups: 2,
                total_creeps: 4,
                melee_creeps: 1,
                ranged_creeps: 2,
                healer_creeps: 1,
            }, 
            capture_groups: {
                total_groups: 0,
            },               
        },
        Tier3: {
            harvester_groups: {
                total_groups: 1,
                total_creeps: 4,
                harvester_creeps: 2,
                transport_creeps: 2,

            },
            build_groups: {
                total_groups: 1,
                total_creeps: 1,
                builder_creeps: 1,
            },
            defense_groups: {
                total_groups: 1,
                total_creeps: 3,
                melee_creeps: 1,
                ranged_creeps: 1,
                healer_creeps: 1,
            },
            attack_groups: {
                total_groups: 5,
                total_creeps: 4,
                melee_creeps: 1,
                ranged_creeps: 2,
                healer_creeps: 1,
            },  
            capture_groups: {
                total_groups: 0,
            },               
        },
        Tier4: {
            harvester_groups: {
                total_groups: 1,
                total_creeps: 4,
                harvester_creeps: 2,
                transport_creeps: 2,

            },
            build_groups: {
                total_groups: 1,
                total_creeps: 1,
                builder_creeps: 1,
            },
            defense_groups: {
                total_groups: 1,
                total_creeps: 3,
                melee_creeps: 1,
                ranged_creeps: 1,
                healer_creeps: 1,
            },
            attack_groups: {
                total_groups: 10,
                total_creeps: 4,
                melee_creeps: 1,
                ranged_creeps: 2,
                healer_creeps: 1,
            }, 
            capture_groups: {
                total_groups: 0,
            },                
        }
    },

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

    Init:function() {

        TState.Structures.Spawn.InitSpawn();
        TState.Structures.Extensions.InitExtensions();
        TState.Structures.InitEnergySupply();
        TState.Sources.InitRoomSources();
        TState.Groups.InitGroups();
        TState.Groups.ScanGroups()
        TState.Preflight = true;
    },

   


    CheckTechLevel:function() {
        //Will check how many groups we have. 
        //How many resources we have.
        //And how long its been since "Max tech groups" numbers reached
    },


    Structures: {

        InitEnergySupply:function() {
            //Run through initial spawn and get its energy.
            for (let i = 0; i < TState.Spawns.length; i++) {
                TState.AvailableEnergy += TState.Spawns[i].store[RESOURCE_ENERGY];
            }
        },


        Spawn: {
            InitSpawn:function() {
                TState.Spawns = [];
                TState.Spawns = TState.Spawns.concat(getObjectsByPrototype(StructureSpawn).find(i => i.my));
            },
        },

        Extensions: {
            InitExtensions:function() {
                TState.Extensions = utils.getObjectsByPrototype(StructureExtension).find(i => i.my);
            },
        },
    },

    Sources: {
        InitRoomSources:function() {
            TState.RoomSources = [];
            TState.RoomSources = TState.RoomSources.concat(utils.getObjectsByPrototype(Source));
        },
    },

    Groups: {
        InitGroups:function() {
            for (let i = 0; i<TState.CreepGroupKey.length; i++) {
                //If CreepGroupKey does not exist. Create it.
                if (!TState.CreepGroups[TState.CreepGroupKey[i]]) {
                    TState.CreepGroups[TState.CreepGroupKey[i]] = [];
                }
                switch (TState.TechLevel) {
                    //CreepGroupKey: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
                    //TODO: create capture_groups
                    case "TIER0":
                        if (TState.CreepGroupKey[i] == "harvester_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier0.harvester_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier0.harvester_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                                TState.CreepGroupIdTicker++;
                            }
                        }
                        if (TState.CreepGroupKey[i] == "build_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier0.build_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier0.build_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                                TState.CreepGroupIdTicker++;
                            }
                        }
                        if (TState.CreepGroupKey[i] == "defense_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier0.defense_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier0.defense_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                                TState.CreepGroupIdTicker++;
                            }
                        }
                        if (TState.CreepGroupKey[i] == "attack_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier0.attack_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier0.attack_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                                TState.CreepGroupIdTicker++;
                            }
                        }
                    break;
                    case "TIER1":
                        if (TState.CreepGroupKey[i] == "harvester_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier1.harvester_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier1.harvester_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "build_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier1.build_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier1.build_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "defense_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier1.defense_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier1.defense_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "attack_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier1.attack_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier1.attack_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                    break;
                    case "TIER2":
                        if (TState.CreepGroupKey[i] == "harvester_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier2.harvester_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier2.harvester_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "build_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier2.build_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier2.build_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "defense_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier2.defense_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier2.defense_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "attack_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier2.attack_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier2.attack_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                    break;
                    case "TIER3":
                        if (TState.CreepGroupKey[i] == "harvester_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier3.harvester_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier3.harvester_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "build_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier3.build_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier3.build_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "defense_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier3.defense_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier3.defense_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "attack_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier3.attack_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier3.attack_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                    break;
                    case "TIER4":
                        if (TState.CreepGroupKey[i] == "harvester_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier4.harvester_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier4.harvester_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "build_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier4.build_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier4.build_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "defense_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier4.defense_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier4.defense_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                        if (TState.CreepGroupKey[i] == "attack_groups" && TState.CreepGroups[TState.CreepGroupKey[i]].length < TState.GroupTierCriteria.Tier4.attack_groups.total_groups) {
                            for (let j = TState.CreepGroups[TState.CreepGroupKey[i]].length; j < TState.GroupTierCriteria.Tier4.attack_groups.total_groups; j++) {
                                let new_group = {
                                    ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                                    CreepsWrapper:[],
                                    Objectives:[],
                                }                 
                                TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);
                            }
                        }
                    break;
                }               
            }
        },

        ScanGroups:function () {
            for (let i = 0; i<TState.CreepGroupKey.length; i++) {
                if ((TState.CreepGroupKey[i] in TState.CreepGroups)) {
                    //CreepGroupKey: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
                    //TODO Add capture groups

                    if (TState.CreepGroupKey[i] == "harvester_groups") {
                        for (let j = 0; j < TState.CreepGroups[TState.CreepGroupKey[i]].length; j++) {
                            if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length == 0) {
                                switch(TState.TechLevel) {
                                    case "TIER0":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }  
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER1":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }  
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER2":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }  
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER3":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }  
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER4":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }  
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;

                                }

                            } else if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length > 0) {
                                let harvester_total = 0;
                                let transport_total = 0;
                                
                                for (let k = 0; k <TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length; k++) {
                                    if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "harvester") {
                                        harvester_total++;
                                    }
                                    if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "transporter") {
                                        transport_total++;
                                    }
                                }

                                switch (TState.TechLevel) {
                                    case "TIER0":
                                        for (let k = harvester_total; k < TState.GroupTierCriteria.Tier0.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                            
                                        }
                                    
        
                                
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier0.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER1":
                                        for (let k = harvester_total; k < TState.GroupTierCriteria.Tier1.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    
        
                                
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier1.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER2":
                                        for (let k = harvester_total; k < TState.GroupTierCriteria.Tier2.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    
        
                                
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier2.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER3":
                                        for (let k = harvester_total; k < TState.GroupTierCriteria.Tier3.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    
        
                                
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier3.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER4":
                                        for (let k = harvester_total; k < TState.GroupTierCriteria.Tier4.harvester_groups.harvester_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "harvester",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    
        
                                
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier4.harvester_groups.transport_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "transporter",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                }                                    
                            }
                        }
                    }                    
                    
                    if (TState.CreepGroupKey[i] == "build_groups") {
                        for (let j =0; j< TState.CreepGroups[TState.CreepGroupKey[i]].length; j++) {
                            if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length == 0) {
                                switch (TState.TechLevel) {
                                    case "TIER0":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }  
                                    break;
                                    case "TIER1":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        } 
                                    break;
                                    case "TIER2":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        } 
                                    break;
                                    case "TIER3":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        } 
                                    break;
                                    case "TIER4":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        } 
                                    break;
                                }
                                 
                            } else if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length > 0) {
                                let builder_total = 0;
                                for (let k = 0; k <TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length; k++) {
                                    if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "builder") {
                                        builder_total++;
                                    }
                                }
                                
                                switch(TState.TechLevel) {
                                    case "TIER0":
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier0.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER1":
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier1.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER2":
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier2.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER3":
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier3.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER4":
                                        for (let k = transport_total; k < TState.GroupTierCriteria.Tier4.build_groups.builder_creeps; k++) {
                                            let Wrapper = {
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "builder",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                }                                
                            }
                        }
                    }

                    if (TState.CreepGroupKey[i] == "defense_groups") {
                        for (let j =0; j< TState.CreepGroups[TState.CreepGroupKey[i]].length; j++) {
                            if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length == 0) {
                                switch (TState.TechLevel) {
                                    case "TIER0":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER1":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER2":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        break;
                                    case "TIER3":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER4":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
        
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                }

                            } else if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length > 0) {
                                let melee_total = 0; 
                                let ranged_total = 0; 
                                let healer_total = 0;
                                for (let k = 0; k< TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length; k++) {
                                    if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "melee") {
                                        melee_total++;
                                    }
                                    if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "ranged") {
                                        ranged_total++;
                                    }
                                    if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "healer") {
                                        healer_total++;
                                    }
                                }

                                switch(TState.TechLevel) {
                                    case "TIER0":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier0.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier0.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier0.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER1":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier1.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier1.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier1.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER2":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier2.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier2.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier2.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER3":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier3.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier3.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier3.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        break;
                                    case "TIER4":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier4.defense_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier4.defense_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier4.defense_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;

                                }


                            }
                        }
                    }

                    if (TState.CreepGroupKey[i] == "attack_groups") {
                        for (let j =0; j< TState.CreepGroups[TState.CreepGroupKey[i]].length; j++) {
                            if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length == 0) {
                                switch (TState.TechLevel){
                                    case "TIER0":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier0.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER1":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier1.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER2":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier2.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER3":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier3.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER4":
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "ranged",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = 0; k < TState.GroupTierCriteria.Tier4.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "healer",
                                                Creep: null,
        
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                }
                            } else if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length > 0) {
                                let melee_total = 0;
                                let ranged_total = 0; 
                                let healer_total = 0; 
                                for (let k = 0; k <TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length; k++) {
                                    if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "melee") {
                                        melee_total++;
                                    }
                                    if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "ranged") {
                                        ranged_total++;
                                    }
                                    if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "healer") {
                                        healer_total++;
                                    }
                                }

                                switch(TState.TechLevel) {
                                    case "TIER0":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier0.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier0.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier0.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER1":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier1.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier1.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier1.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER2":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier2.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier2.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier2.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER3":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier3.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier3.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier3.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                    case "TIER4":
                                        for (let k = melee_total; k < TState.GroupTierCriteria.Tier4.attack_groups.melee_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = ranged_total; k < TState.GroupTierCriteria.Tier4.attack_groups.ranged_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                        for (let k = healer_total; k < TState.GroupTierCriteria.Tier4.attack_groups.healer_creeps; k++) {
                                            let Wrapper = {
                                                ID: TState.CreepIdTicker++,
                                                GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                CreepType: "melee",
                                                Creep: null,
                                            };
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.push(Wrapper);
                                        }
                                    break;
                                }
                            }
                        }
                    }                    
                }
            }
        },    



        Creeps: {
            BuildCreep:function() {
    
            },    
        },
    },
};


export function loop() {
    //TODO: Trigger Inits based off error flags thrown.
    if (!TState.Preflight) {
        TState.Init();
        //console.log(TState.CreepGroups["harvester_groups"].length);
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
    }
}
