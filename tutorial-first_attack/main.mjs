import { getObjectsByPrototype } from '/game/utils';
import { Creep } from '/game/prototypes';
import { ERR_NOT_IN_RANGE } from '/game/constants';

export function loop() {
    // Your code goes here
    var creeps = getObjectsByPrototype(Creep);
    let my_creeps = creeps.find(creep => creep.my);
    let enemy_creeps = creeps.find(creep => !creep.my);
    if(my_creeps.attack(enemy_creeps) == ERR_NOT_IN_RANGE) {
        my_creeps.moveTo(enemy_creeps);
    }

}
