import getPerson from "./getPerson"
import getFriends from "./getFriends"
import getFriendsOfFriend from "./getFriendsofFriend"
import getHighestByRating from './getHighestByRating'
import getNewReviews from './getNewReviews'

type AppSyncEvent = {

    info  : {
        fieldName : string
    },

    arguments : {
        restaurant_name : string
    }

}

exports.handler = async (event: AppSyncEvent)  => {

    switch(event.info.fieldName){

        case "getPerson":
            return await getPerson()
        case "getFriends":
            return await getFriends()
        case "getFriendsOfFriend":
            return await getFriendsOfFriend()
        case "getHighestByRating":
            return await getHighestByRating()
        case "getNewReviews":
            return await getNewReviews(event.arguments.restaurant_name)
    }

}