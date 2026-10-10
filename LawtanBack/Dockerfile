# ===================================================================
# Étape 1 : Build de l'application Spring Boot avec Maven
# ===================================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Optimisation du cache Docker pour les dépendances
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compilation du code source et création du JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ===================================================================
# Étape 2 : Image finale légère pour la production (Alpine JRE 17)
# ===================================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

ENV PORT=8080
EXPOSE 8080

# Copie du JAR produit à l'étape 1
COPY --from=build /app/target/lawtan-back-0.0.1-SNAPSHOT.jar app.jar

# Création et utilisation d'un utilisateur non-root pour des raisons de sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Commande de démarrage optimisée pour le cloud (Render Free Tier 512Mo)
# Dimensionnement pour une instance 512 Mo :
#   -Xmx384m laissait ~128 Mo pour metaspace + code cache + piles, alors que
#   Spring Boot en consomme 140 a 190 Mo. Le conteneur depassait sa limite et
#   partait en thrashing GC : le demarrage se figeait sans lever d'exception.
#   MaxRAMPercentage borne le tas a la taille reelle du conteneur, et
#   TieredStopAtLevel=1 accelere nettement le demarrage sur un seul CPU.
ENTRYPOINT ["java",   "-XX:+UseSerialGC",   "-XX:MaxRAMPercentage=60.0",   "-XX:MaxMetaspaceSize=128m",   "-XX:TieredStopAtLevel=1",   "-Xss512k",   "-Djava.security.egd=file:/dev/./urandom",   "-jar", "app.jar"]
