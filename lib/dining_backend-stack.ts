import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as appsync from "@aws-cdk/aws-appsync";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as neptune from "@aws-cdk/aws-neptune";
import * as ec2 from "@aws-cdk/aws-ec2";
import {requestTemplate,responseTemplate} from "../utils/appsync-request-response"

export class DiningBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const api = new appsync.GraphqlApi(this, "DiningByFriends", {
      name: "DiningByFriends",
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });

    const vpc = new ec2.Vpc(this, "Vpc");

    const neptuneCluster = new neptune.DatabaseCluster(this, "NeptuneCluster", {
      vpc,
      instanceType: neptune.InstanceType.T3_MEDIUM,
      dbClusterName: "DbCluster"
    });
    
    neptuneCluster.connections.allowDefaultPortFromAnyIpv4('Open to the world')

    const writeAddress = neptuneCluster.clusterEndpoint.socketAddress;
    const readAddress = neptuneCluster.clusterReadEndpoint.socketAddress

    // Http Datasource
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com",
      {
        name: "httpDsEventDining",
        description: "Appsync To Event Bridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events"
        },
      }
    );

    
    const getQueryLambda = new lambda.Function(this, "Lambda_GetQuery", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda/lambda2'),
      handler: "main.handler",
      memorySize: 1024,
      timeout: cdk.Duration.minutes(2),
      vpc,
      
    })

    getQueryLambda.addEnvironment('WRITER', writeAddress)
    getQueryLambda.addEnvironment('READER', readAddress)

    const lambdaDataSource = api.addLambdaDataSource("lambdaDataSource", getQueryLambda);

    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getPerson"
    });

    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getFriends"
    });


    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getFriendsOfFriend"
    });

    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getHighestByRating"
    });

    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getHighestRatedByCuisine"
    });

    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getNewReviews"
    });

  

    const mutations = ["addPerson","addFriend","addCity","addFriendsOfFriend","deleteVertices","clearGraph","addRestaurant","addReview","addCuisine","addState"]

    mutations.forEach((mut) => {
      if (mut === "addPerson"){
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"city\\\" : \\\"$ctx.arguments.city\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addPerson",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if(mut === "addFriend"){
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"city\\\" : \\\"$ctx.arguments.city\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addFriend",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if(mut === "addCity"){
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addCity",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if(mut === "addFriendsOfFriend"){
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"friendName\\\" : \\\"$ctx.arguments.friendName\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addFriendsOfFriend",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if(mut === "deleteVertices"){
        let details = `\\\"label\\\" : \\\"$ctx.arguments.label\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "deleteVertices",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if (mut === "clearGraph") {
        let details = `\\\"key\\\" : \\\"$ctx.arguments.key\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "clearGraph",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })

      }

      else if (mut === "addRestaurant") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" , \\\"cuisine\\\" : \\\"$ctx.arguments.cuisine\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addRestaurant",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })

      }

      else if (mut === "addReview") {
        let details = `\\\"nameOfCustomer\\\" : \\\"$ctx.arguments.nameOfCustomer\\\" , \\\"rating\\\" : \\\"$ctx.arguments.rating\\\" , \\\"body\\\" : \\\"$ctx.arguments.body\\\" , \\\"restaurant_name\\\" : \\\"$ctx.arguments.restaurant_name\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addReview",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })

      }

      else if (mut === "addCuisine") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\" `
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addCuisine",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }

      else if (mut === "addState") {
        let details = `\\\"name\\\" : \\\"$ctx.arguments.name\\\"`
        httpDs.createResolver({
          typeName: "Mutation",
          fieldName: "addState",
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        })
      }
     

    });

    const neptuneLambdaFn = new lambda.Function(this, "lambdaDining", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda/lambda1'),
      handler: "neptuneHandler.handler",
      memorySize: 1024,
      timeout: cdk.Duration.minutes(2),
      vpc,
    });

    neptuneLambdaFn.addEnvironment('WRITER', writeAddress)
    neptuneLambdaFn.addEnvironment('READER', readAddress)


    events.EventBus.grantAllPutEvents(httpDs); 

     
     new cdk.CfnOutput(this, "writeAddress", {
      value: writeAddress,
    });

    new cdk.CfnOutput(this, "readAddress", {
      value: readAddress,
    });


    const rule = new events.Rule(this, "DiningEventRule", {
      eventPattern: {
        source: ["DiningByFriends"],
        detailType: ["addPerson","addFriend","addCity","addFriendsOfFriend","deleteVertices","clearGraph","addRestaurant","addReview","addCuisine","addState"],
      }
    });
    rule.addTarget(new targets.LambdaFunction(neptuneLambdaFn))



  }
}
