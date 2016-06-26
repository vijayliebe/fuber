# fuber

#Things to be installed
1.Node and NPM
2.MongoDb

#create location index
1.start mongo server
2.open mongo shell
3.run this query - db.cab.ensureIndex({location:"2dsphere"})
Note - constraints and other indexes needed to implemented for query optimization

#How to start
1.clone project
2.Go to project directory
3.Sudo npm install
4.sails lift
5.open http://localhost:1337/

