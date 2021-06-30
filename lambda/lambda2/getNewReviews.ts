const gremlin = require("gremlin")

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection;
const Graph = gremlin.structure.Graph;
const uri = process.env.READER


const getNewReviews = async (restaurant_name: String) => {
    const dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);

    try{

        console.log("Event", restaurant_name)
        var data = await g.V().has("Restaurant","name", restaurant_name)
        .in_("about").order().by("createdDate").limit(2).toList()
        console.log("data",data)

        var newReviews = Array()
        for (const v of data) {
            var _properties = await g.V(v.id).properties().toList()
            var reviews = _properties.reduce((acc: any, next: any) => {
                console.log("Reviews" , reviews)
                acc[next.label] = next.value
                return acc
            }, {})
        reviews.id = v.id
        newReviews.push(reviews)
        console.log("newReviews" , JSON.stringify(newReviews))
        }
        
        return newReviews

    }
    catch(err){
        console.log("err" , err)
        return  "This is the" + err
        
    }

}

export default getNewReviews