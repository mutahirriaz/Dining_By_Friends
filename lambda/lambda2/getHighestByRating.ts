import * as gremlin from "gremlin";
// const gremlin = require("gremlin")


const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER
const Order = gremlin.process.order;
const P = gremlin.process.P;
const Coloumn = gremlin.process.column;
const values = gremlin.process.column.values;
const __ = gremlin.process.statics;

 declare global {
    interface ObjectConstructor {
      fromEntries(xs: [string|number|symbol, any][]): object
    }
  }

const getHighestByRating = async () => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try{

        var data = await g.V().has("Person", "name", "Mutahir").out().out().
         in_("withIn").
         in_("about").group().
         by(__.identity()).
         by(__.in_('about').values('rating')).
         order().by(values , Order.desc).limit(2).unfold().
         project("name", "address", "rating", "cuisine").
         by(__.select(Coloumn.keys).values("name")).
         by(__.select(Coloumn.keys).values("address")).
         by(__.select(Coloumn.values)).
         by(__.select(Coloumn.keys).out("serves").values("name")).toList()
        
        console.log("data>>>" , JSON.stringify(data))


        const listObj = data.map((m:any) => Object.fromEntries(m))
        console.log("ListObj" , listObj)
        return listObj


    }
    catch(err){
        console.log()
        return "There is an error" + err
    }

}

export default  getHighestByRating