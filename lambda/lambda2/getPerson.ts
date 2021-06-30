const gremlin = require('gremlin');

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER

const getPerson = async () => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try{

        let data = await g.V().hasLabel("Person").toList();
        let persons = Array()
        for (const v of data) {
            const _properties = await g.V(v.id).properties().toList()
            let person = _properties.reduce((acc: any, next: any) => {
                acc[next.label] = next.value
                return acc
            }, {})
        person.id = v.id
        persons.push(person)
        console.log("persons" , JSON.stringify(persons))
        }
        
        return persons

    }
    catch(err){
        console.log("Error>>", err)
        return err
    }

}

export default  getPerson