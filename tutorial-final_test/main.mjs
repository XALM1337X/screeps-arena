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
    CreepGroupKeys: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"],
    RoomSources: [],
    GroupTierCriteria: [],

    

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
        TState.Groups.InitGroupTierCriteria();
        //TState.Groups.InitGroups();
        //TState.Groups.ScanGroupsCreepWrappers()
        


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

            if (TState.Extensions) {
                for (let j = 0; j < TState.Extensions.length; j++) {
                    TState.AvailableEnergy += TState.Extensions[j].store[RESOURCE_ENERGY];
                }
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
            /*

            if (!TState.CreepGroups["harvester_groups"]) {
                TState.CreepGroups["harvester_groups"] = [];
            }
            for (let i = 0; i < )
            if (TState.CreepGroups["harvester_groups"].length < TState.GroupTierCriteria[TState.TechLevel].total_groups) {
                for (let j = TState.CreepGroups["harvester_groups"].length; j < TState.GroupTierCriteria[TState.TechLevel][i].total_groups; j++) {
                    let new_group = {
                        ID: "harvester_groups"+"-"+TState.CreepGroupIdTicker,
                        CreepsWrapper:[],
                        Objectives:[],
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
                        Objectives:[],
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
                        Objectives:[],
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
                        Objectives:[],
                    }                 
                    TState.CreepGroups["attack_groups"].push(new_group);
                    TState.CreepGroupIdTicker++;
                }
            } */           
        },
        

        InitGroupTierCriteria:function () {
            //CreepGroupKey: ["harvester_groups", "defense_groups", "attack_groups", "build_groups","capture_groups"]

            for (let i = 0; i < TState.TechLevelKeys.length; i++) {                
                if (!TState.GroupTierCriteria[TState.TechLevelKeys[i]]) {
                    TState.GroupTierCriteria[TState.TechLevelKeys[i]] = [];
                }
                let harvester_groups = {};
                let build_groups = {};
                let defense_groups = {};
                let attack_groups = {};
                let capture_groups = {};
                switch (TState.TechLevelKeys[i]) {
                    case "TIER0":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                            total_groups: 1,
                            total_creeps: 4,
                            harvester_creeps: 2,
                            transport_creeps: 2,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                            total_groups: 1,
                            total_creeps: 1,
                            builder_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                            total_groups: 1,
                            total_creeps: 3,
                            melee_creeps: 1,
                            ranged_creeps: 1,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                            total_groups: 1,
                            total_creeps: 4,
                            melee_creeps: 1,
                            ranged_creeps: 2,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                            total_groups: 0,
                        };


                    break;
                    case "TIER1":
                       
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                            total_groups: 1,
                            total_creeps: 4,
                            harvester_creeps: 2,
                            transport_creeps: 2,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                            total_groups: 1,
                            total_creeps: 1,
                            builder_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                            total_groups: 1,
                            total_creeps: 3,
                            melee_creeps: 1,
                            ranged_creeps: 1,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                            total_groups: 1,
                            total_creeps: 4,
                            melee_creeps: 1,
                            ranged_creeps: 2,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                            total_groups: 0,
                        };
                    break;
                    case "TIER2":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                            total_groups: 1,
                            total_creeps: 4,
                            harvester_creeps: 2,
                            transport_creeps: 2,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                            total_groups: 1,
                            total_creeps: 1,
                            builder_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                            total_groups: 1,
                            total_creeps: 3,
                            melee_creeps: 1,
                            ranged_creeps: 1,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                            total_groups: 2,
                            total_creeps: 4,
                            melee_creeps: 1,
                            ranged_creeps: 2,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                            total_groups: 0,
                        };
                    break;
                    case "TIER3":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                            total_groups: 1,
                            total_creeps: 4,
                            harvester_creeps: 2,
                            transport_creeps: 2,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                            total_groups: 1,
                            total_creeps: 1,
                            builder_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                            total_groups: 1,
                            total_creeps: 3,
                            melee_creeps: 1,
                            ranged_creeps: 1,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                            total_groups: 5,
                            total_creeps: 4,
                            melee_creeps: 1,
                            ranged_creeps: 2,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                            total_groups: 0,
                        };
                    break;
                    case "TIER4":
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["harvester_groups"] = {
                            total_groups: 1,
                            total_creeps: 4,
                            harvester_creeps: 2,
                            transport_creeps: 2,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["build_groups"] = {
                            total_groups: 1,
                            total_creeps: 1,
                            builder_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["defense_groups"] = {
                            total_groups: 1,
                            total_creeps: 3,
                            melee_creeps: 1,
                            ranged_creeps: 1,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["attack_groups"] = {
                            total_groups: 10,
                            total_creeps: 4,
                            melee_creeps: 1,
                            ranged_creeps: 2,
                            healer_creeps: 1,
                        };
                        TState.GroupTierCriteria[TState.TechLevelKeys[i]]["capture_groups"] = {
                            total_groups: 0,
                        };
                    break;
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
                            CreepType: "harvester",
                            Creep: null,

                        };
                        TState.CreepGroups["harvester_groups"][i].CreepsWrapper.push(Wrapper);
                    }  

                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].harvester_groups.transport_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_groups"][i].ID,
                            CreepType: "transporter",
                            Creep: null,
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
                            CreepType: "harvester",
                            Creep: null,

                        };
                        TState.CreepGroups["harvester_groups"][i].CreepsWrapper.push(Wrapper);
                        
                    }                
                    for (let j = transport_total; j < TState.GroupTierCriteria[TState.TechLevel].harvester_groups.transport_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["harvester_groups"][i].ID,
                            CreepType: "transporter",
                            Creep: null,
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
                            CreepType: "builder",
                            Creep: null,

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
                            CreepType: "builder",
                            Creep: null,
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
                            CreepType: "melee",
                            Creep: null,

                        };
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }

                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_groups.ranged_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            CreepType: "ranged",
                            Creep: null,

                        };
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }

                    for (let k = 0; k < TState.GroupTierCriteria[TState.TechLevel].defense_groups.healer_creeps; k++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            CreepType: "healer",
                            Creep: null,

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
                            CreepType: "melee",
                            Creep: null,

                        };
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = ranged_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_groups.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            CreepType: "ranged",
                            Creep: null,

                        };
                        TState.CreepGroups["defense_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = healer_total; j < TState.GroupTierCriteria[TState.TechLevel].defense_groups.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["defense_groups"][i].ID,
                            CreepType: "healer",
                            Creep: null,

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
                            CreepType: "melee",
                            Creep: null,

                        };
                        TState.CreepGroups["attack_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][i].ID,
                            CreepType: "ranged",
                            Creep: null,

                        };
                        TState.CreepGroups["attack_groups"][i].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = 0; j < TState.GroupTierCriteria[TState.TechLevel].attack_groups.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][i].ID,
                            CreepType: "healer",
                            Creep: null,

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


                    for (let j = melee_total; j < TState.GroupTierCriteria.Tier0.attack_groups.melee_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][j].ID,
                            CreepType: "melee",
                            Creep: null,
                        };
                        TState.CreepGroups["attack_groups"][j].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = ranged_total; j < TState.GroupTierCriteria.Tier0.attack_groups.ranged_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][j].ID,
                            CreepType: "melee",
                            Creep: null,
                        };
                        TState.CreepGroups["attack_groups"][j].CreepsWrapper.push(Wrapper);
                    }
                    for (let j = healer_total; j < TState.GroupTierCriteria.Tier0.attack_groups.healer_creeps; j++) {
                        let Wrapper = {
                            ID: TState.CreepIdTicker++,
                            GroupId: TState.CreepGroups["attack_groups"][j].ID,
                            CreepType: "melee",
                            Creep: null,
                        };
                        TState.CreepGroups["attack_groups"][j].CreepsWrapper.push(Wrapper);
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

        console.log(TState.GroupTierCriteria[TState.TechLevel]);

        //console.log(TState.GroupTierCriteria["TIER0"]);
        //console.log(TState.GroupTierCriteria["TIER1"]);
        //console.log(TState.GroupTierCriteria["TIER2"]);
        //console.log(TState.GroupTierCriteria["TIER3"]);
        //console.log(TState.GroupTierCriteria["TIER4"]);
        //console.log(TState.CreepGroups["harvester_groups"].length);
        
        /*for (let i = 0; i < TState.CreepGroups["harvester_groups"].length; i++) {
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
        }*/
        
    }
}
