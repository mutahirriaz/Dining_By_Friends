import * as gremlin from 'gremlin';
import * as faker from 'faker';
import {EventBridgeEvent, Context} from 'aws-lambda';
import { V4MAPPED } from 'dns';
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const Graph = gremlin.structure.Graph;
const uri = process.env.WRITER

exports.handler = async (event: EventBridgeEvent<string, any>, context: Context) => {

    let dc = new DriverRemoteConnection(`wss://${uri}/gremlin`, {});
    const graph = new Graph();
    const g = graph.traversal().withRemote(dc);


    try{

        console.log("appsync event", event.detail)
        console.log("appsync event detail type", event["detail-type"])
        // add Person

        if(event["detail-type"] === "addPerson"){
            const data = await g.addV("Person").
            property("name", event.detail.name).
            property("city", event.detail.city).next()

            console.log("data>>>",data)
        }

        else if(event["detail-type"] === "addFriend"){
            const edge = await g.addV('Friend').
            property("name", event.detail.name).
            property("city", event.detail.city).
            as("X").V().has("Person","name","Mutahir").
            as("Y").addE("friend").from_("Y").to("X").
            V().has("City","name","Karachi").as("C").addE("lives").
            from_("X").to("C").next()

            console.log("data>>>", edge)

        }

        else if(event['detail-type'] === "addFriendsOfFriend"){
            const friendofFriends = await g.addV("Friend").
            property("name", event.detail.name).
            as("X").
            V().
            has("Friend", "name", event.detail.friendName).
            as("Y").
            addE("friend").
            from_("Y").
            to("X").
            next()

            console.log("data>>>", friendofFriends)
        }

        else if(event["detail-type"] === "addCity"){
            const city = await g.addV("City").property("name", event.detail.name).next()
            
            console.log("city>>", city)

        }

        else if(event["detail-type"] === "clearGraph"){
            await g.V().drop().next()
        }

        else if(event["detail-type"] === "deleteVertices"){
            await g.V().hasLabel(event.detail.label).drop().next()
        }

        else if(event["detail-type"] === "addRestaurant"){
          
            const addrestaurant = await g.addV("Restaurant").
            property("name", event.detail.name).
            property("restaurant_id", faker.datatype.number(3)).
            property("address", faker.address.streetAddress()).
            as("restaurant").V().has("City","name","Karachi").
            as("city").
            addE("withIn").
            from_("restaurant").to("city").
            next()

            const serve = await g.addV("Cuisine").
            property("name", event.detail.cuisine).
            as("csn").V().has("Restaurant","name",event.detail.name).
            as("rest").addE("serves").
            from_("rest").
            to("csn").
            next()

            console.log("Restaurant>>>", JSON.stringify(addrestaurant))
            console.log("Serve>>>", JSON.stringify(serve))

        }

        else if(event["detail-type"] === "addReview"){

            const review = await g.addV("Review").
            property("customerName", event.detail.nameOfCustomer).
            property("rating", event.detail.rating).
            property("body", event.detail.body).
            property("createdDate", faker.date.recent()).
            as("rev").
            V().has("Restaurant","name",event.detail.restaurant_name).
            as("res").
            addE("about").
            from_("rev").to("res").
            V().has("Friend","name",event.detail.nameOfCustomer).as("frnd").
            addE("wrote").
            from_("frnd").to("rev").
            next()


            console.log("Review>>>", JSON.stringify(review))
        }

        else if (event["detail-type"] === "addState") {
            const state = await g.addV("State").property("name", event.detail.name).next()
            
            console.log("state>>>", JSON.stringify(state))
        }

        else if (event["detail-type"] === "addCuisine") {
            const cuisine = await g.addV("Cuisine").property("name", event.detail.name).next()
            console.log("Cuisine>>>", JSON.stringify(cuisine))
        }

       
    }
    catch(err){
        console.log("Error in Query", err)
        return err
    }

}