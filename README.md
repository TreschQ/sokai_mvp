# SOKAI_MVP

Cette version de README ne doit jamais aller sur main

Pour mettre en réseau le conteneur de l'api d'ia avec le conteneur du frontend (en attendant un docker-compose.yml fonctionnel) :
 ```bash
 docker network create nom-reseau
 # si vous lancer depuis le terminal
 docker run --network nom-reseau
 docker run --network nom-reseau 

 #si vous lancer depuis l'application 

 docker network connect nom-reseau nom-comteneur

 # pour trouver l'adresse IP du comteneur de l'api de l'ia

 docker network inspect nom-reseau
 ```

 Puis dans le json généré vous devez trouver :

 ```json
 "Containers": {
            "83119e038f3d42419812e33a3c588f3da44a2f329c4508b0ae77d3059b761628": {
                "Name": "crazy_edison",
                "EndpointID": "2313f37330709335345fee87f0ac5f10916cfaad7ba85e69ca6470d6cd1a7175",
                "MacAddress": "b2:a2:9b:00:1a:ee",
                "IPv4Address": "172.21.0.3/16",
                "IPv6Address": ""
            },
            "c7b703c9be1cd0daa6cf5be7945cd35a0c167360e667f7937d847c0c03832991": {
                "Name": "ia-api",
                "EndpointID": "e9aa0010e25f8a464cb4f7bf248067c8084700f87c8f22bb9e4bad5f643029c7",
                "MacAddress": "4e:e1:c9:78:2d:b7",
                "IPv4Address": "172.21.0.2/16",
                "IPv6Address": ""
            }
 }

 ```

 Prenez la valeur de Containers["83119e038f3d42419812e33a3c588f3da44a2f329c4508b0ae77d3059b761628"]["IPv4Address"]


