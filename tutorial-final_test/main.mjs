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
    GroupUpgradeCriteria: {
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
                total_groups: 0,
                total_creeps: 0,
            },
            capture_groups: {
                total_groups: 0,
                total_creeps: 0,
            },
        },
        /*Tier1: {
            harvester_groups: {
                total_groups: 1,
            },
            build_groups: {
                total_groups: 1,
            },
            defense_groups: {
                total_groups: 1,
            },
            attack_groups: {
                total_groups: 0,
            }, 
            capture_groups: {
                total_groups: 0,
            },               
        },
        Tier2: {
            harvester_groups: {
                total_groups: 1,
            },
            build_groups: {
                total_groups: 1,
            },
            defense_groups: {
                total_groups: 1,
            },
            attack_groups: {
                total_groups: 2,
            }, 
            capture_groups: {
                total_groups: 0,
            },               
        },
        Tier3: {
            harvester_groups: {
                total_groups: 1,
            },
            build_groups: {
                total_groups: 1,
            },
            defense_groups: {
                total_groups: 2,
            },
            attack_groups: {
                total_groups: 5,
            }, 
            capture_groups: {
                total_groups: 0,
            },               
        },
        Tier4: {
            harvester_groups: {
                total_groups: 1,
            },
            build_groups: {
                total_groups: 1,
            },
            defense_groups: {
                total_groups: 5,
            },
            attack_groups: {
                total_groups: 10,
            },
            capture_groups: {
                total_groups: 0,
            },                
        }*/
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
        TState.Groups.InitGroups();
        TState.Sources.InitRoomSources();
        TState.Structures.InitEnergySupply();
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
                if (!(TState.CreepGroupKey[i] in TState.CreepGroups)) {
                    let new_group = {
                        ID: TState.CreepGroupKey[i]+"-"+TState.CreepGroupIdTicker,
                        CreepsWrapper:[],
                        Objectives:[],
                    }
                    
                    TState.CreepGroups[TState.CreepGroupKey[i]] = [];
                    TState.CreepGroups[TState.CreepGroupKey[i]].push(new_group);

                } 
            }
        },

        ScanGroups:function () {
            for (let i = 0; i<TState.CreepGroupKey.length; i++) {
                if ((TState.CreepGroupKey[i] in TState.CreepGroups)) {
                    //CreepGroupKey: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
                    switch (TState.TechLevel) {
                        case"TIER0":
                            if (TState.CreepGroupKey[i] == "harvester_groups") {
                                for (let j = 0; j < TState.CreepGroups[TState.CreepGroupKey[i]].length; j++) {
                                    if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length == 0) {
                                        for (let k = 0; k < TState.GroupUpgradeCriteria.Tier0.harvester_groups.harvester_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "harvester",
                                                    Creep: null,

                                                }
                                            );
                                        }   
                                        for (let k = 0; k < TState.GroupUpgradeCriteria.Tier0.harvester_groups.transport_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "transporter",
                                                    Creep: null,
                                                }
                                            );
                                        }
                                    } else if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length > 0 && TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length < TState.GroupUpgradeCriteria.Tier0.harvester_groups.total_creeps) {
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

                                        
                                        for (let k = harvester_total; k < TState.GroupUpgradeCriteria.Tier0.harvester_groups.harvester_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "harvester",
                                                    Creep: null,

                                                }
                                            );
                                        }
                                    

                                
                                        for (let k = transport_total; k < TState.GroupUpgradeCriteria.Tier0.harvester_groups.transport_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "transporter",
                                                    Creep: null,
                                                }
                                            );
                                        }
                                            
                                    }
                                }
                            }
                            if (TState.CreepGroupKey[i] == "build_groups") {
                                for (let j =0; j< TState.CreepGroups[TState.CreepGroupKey[i]].length; j++) {
                                    if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length == 0) {
                                        for (let k = 0; k < TState.GroupUpgradeCriteria.Tier0.build_groups.builder_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "builder",
                                                    Creep: null,

                                                }
                                            );
                                        }   
                                    } else if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length > 0 && TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length < TState.GroupUpgradeCriteria.Tier0.build_groups.total_creeps) {
                                        let builder_total = 0;
                                        for (let k = 0; k <TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length; k++) {
                                            if (TState.CreepsGroups[TState.CreepGroupKey[i]][j].CreepsWrapper[k].CreepType == "builder") {
                                                builder_total++;
                                            }
                                        }
                                       
                                        for (let k = transport_total; k < TState.GroupUpgradeCriteria.Tier0.build_groups.builder_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "builder",
                                                    Creep: null,
                                                }
                                            );
                                        }
                                        
                                    }
                                }
                            }
                            if (TState.CreepGroupKey[i] == "defense_groups") {
                                for (let j =0; j< TState.CreepGroups[TState.CreepGroupKey[i]].length; j++) {
                                    if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length == 0) {
                                        for (let k = 0; k < TState.GroupUpgradeCriteria.Tier0.defense_groups.melee_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "melee",
                                                    Creep: null,

                                                }
                                            );
                                        }

                                        for (let k = 0; k < TState.GroupUpgradeCriteria.Tier0.defense_groups.ranged_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "ranged",
                                                    Creep: null,

                                                }
                                            );
                                        }

                                        for (let k = 0; k < TState.GroupUpgradeCriteria.Tier0.defense_groups.healer_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "healer",
                                                    Creep: null,

                                                }
                                            );
                                        }





                                    } else if (TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length > 0 && TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrapper.length < TState.GroupUpgradeCriteria.Tier0.defense_groups.total_creeps) {
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

                                        for (let k = melee_total; k < TState.GroupUpgradeCriteria.Tier0.defense_groups.melee_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "melee",
                                                    Creep: null,

                                                }
                                            );
                                        }
                                        for (let k = ranged_total; k < TState.GroupUpgradeCriteria.Tier0.defense_groups.ranged_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "ranged",
                                                    Creep: null,

                                                }
                                            );
                                        }
                                        for (let k = healer_total; k < TState.GroupUpgradeCriteria.Tier0.defense_groups.healer_creeps; k++) {
                                            TState.CreepGroups[TState.CreepGroupKey[i]][j].CreepsWrappers.push(
                                                Wrapper = {
                                                    GroupId: TState.CreepGroups[TState.CreepGroupKey[i]][j].ID,
                                                    CreepType: "healer",
                                                    Creep: null,

                                                }
                                            );
                                        }
                                    }
                                }
                            }
                    }
                }
            }
        },    
        /*
            GroupUpgradeCriteria: {
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
                        total_groups: 0,
                        total_creeps: 0,
                    },
                    capture_groups: {
                        total_groups: 0,
                        total_creeps: 0,
                    },
                },
            }
        */


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
        console.log(TState);
    }
}
