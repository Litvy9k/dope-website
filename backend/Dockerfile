FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./

EXPOSE 5000

CMD ["dotnet", "watch", "run", "--urls=http://0.0.0.0:5000"]