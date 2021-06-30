// import * as gremlin from "gremlin";
const gremlin = require("gremlin")

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER


const getFriendsOfFriend = async () => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try{

        const data = await g.V().has("Person", "name", "Mutahir").out().out().toList()
        let friendsOfFriends = Array();
        console.log("data>>>", JSON.stringify(data))

        for (const v of data) {
            let _properties = await g.V(v.id).properties().toList();
            let result = _properties.reduce((acc, next) => {
                acc[next.label] = next.value
                return acc
            }, {});
            result.id = v.id
            friendsOfFriends.push(result)
        }
        return friendsOfFriends

    }
    catch(err){
        console.log()
        return "There is an error" + err
    }

}

export default getFriendsOfFriend