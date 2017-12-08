import React, {Component} from "react";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clientId: 0,
            clientName: "Escolha um cliente",
            clientList: [],
            linesList: [],
            selectedLineId: 0,
            routesList: [],
            selectedRouteId: 0,
            referencePointsList: [],
            vehiclesInRoute: [],
            mapCenter: {lat: -22.79575, lng: -43.36342},
            mapZoom: 16,
            defaultMapCenter: {lat: -22.79575, lng:  -43.36342},
            defaultMapZoom: 16,
            mapAccessKey: {
                key: "AIzaSyCMfQ6a_eX4SwWbyfUqEVCdXYnovZfg9fk"
            },
            vehiclesGarageList: [],
            showVehiclesGarage: false,
            intervalID: 0,
            CONST_MAPPINGS: require("const.json")
        };
    }
    getSOAPUrl(soapCollection, soapParams) {
        let soapUrl = this.state.CONST_MAPPINGS.SOAP_URL;
        if (soapCollection) {
            const SOAP_OPERATOR = this.state.CONST_MAPPINGS.SOAP_OPERATOR;
            soapUrl = soapUrl + "?" + SOAP_OPERATOR + "=" + soapCollection;
            if (soapParams && typeof(soapParams) === "object") {
                let urlParams = "";
                Object.keys(soapParams).forEach((parameter, index) => {
                    urlParams = urlParams + "&" + parameter + "=" + soapParams[parameter];
                });
                soapUrl = soapUrl + urlParams;
            }
            soapUrl = soapUrl + "&cache=" + Date.now(new Date());
        }
        return soapUrl;
    }
    showVehiclesGarage() {
        return this.state.showVehiclesGarage;
    }
    getProgressBarSize() {
        return this.state.progressBarSize;
    }
    getClientId() {
        return this.state.clientId;
    }
    getClientName() {
        return this.state.clientName;
    }
    getVehiclesGarage() {
        const wsCollection = this.state.CONST_MAPPINGS.COL_VEHICLES_GARAGE;
        const wsVehiclesGarage = this.getSOAPUrl(wsCollection);
        let vehiclesGarageList = [];
        this.setState({
            vehiclesGarageList: vehiclesGarageList
        });
        fetch(wsVehiclesGarage).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(this.state.CONST_MAPPINGS.RESPONSE_NOT_OK);
        }).then((json) => {
            if (json.ListaVeiculoGaragemResult && json.ListaVeiculoGaragemResult.hasOwnProperty("WSGaragem")) {
                vehiclesGarageList = json.ListaVeiculoGaragemResult.WSGaragem;
                this.setState({
                    vehiclesGarageList: vehiclesGarageList,
                    showVehiclesGarage: true
                });
                return vehiclesGarageList;
            }
            throw new Error(this.state.CONST_MAPPINGS.RESPONSE_DATA_CHANGED);
        });
        return vehiclesGarageList;
    }
    unsetVehiclesGarage() {
        this.setState({
            vehiclesGarageList: [],
            showVehiclesGarage: false
        });
    }
    getClientList() {
        const wsCollection = this.state.CONST_MAPPINGS.COL_CLIENT_PER_USER;
        const wsClientPerUser = this.getSOAPUrl(wsCollection);
        let clientList = [];
        fetch(wsClientPerUser).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(this.state.CONST_MAPPINGS.RESPONSE_NOT_OK)
        }).then((json) => {
            if (json.ListaClientesPorUsuarioResult && json.ListaClientesPorUsuarioResult.hasOwnProperty("WSCliente")) {
                clientList = json.ListaClientesPorUsuarioResult.WSCliente;
                this.setState({
                    clientList: clientList
                });
                return clientList;
            }
            throw new Error(this.state.CONST_MAPPINGS.RESPONSE_DATA_CHANGED);
        });
        return clientList;
    }
    getLinesPerClient(clientId, clientName) {
        let linesList = [];
        if (clientId && clientName) {
            this.setState({
                clientId: clientId,
                clientName: clientName,
                linesList: linesList,
                selectedLineId: 0
            });
            const wsColletion = this.state.CONST_MAPPINGS.COL_LINES_PER_CLIENT;
            let wsParams = {"clientId": clientId};
            const wsLinesPerClient = this.getSOAPUrl(wsColletion, wsParams);
            fetch(wsLinesPerClient).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(this.state.CONST_MAPPINGS.RESPONSE_NOT_OK)
            }).then((json) => {
                if (json.ListaLinhasClienteResult && json.ListaLinhasClienteResult.hasOwnProperty("WSLinha")) {
                    linesList = json.ListaLinhasClienteResult.WSLinha;
                    let selectedLineId = (linesList.Id_Linha) ? linesList.Id_Linha : linesList[0].Id_Linha;
                    this.setState({
                        linesList: linesList,
                        selectedLineId: selectedLineId
                    });
                    this.getRoutesPerLine(selectedLineId);
                    return linesList;
                }
                throw new Error(this.state.CONST_MAPPINGS.RESPONSE_DATA_CHANGED);
            });
        }
        return linesList;
    }
    getRoutesPerLine(lineId) {
        let routesList = [];
        if (lineId) {
            this.setState({
                selectedLineId: lineId,
                routesList: routesList
            });
            const wsCollection = this.state.CONST_MAPPINGS.COL_ROUTES_PER_LINE;
            let wsParams = {"linha": lineId};
            const wsRoutesPerLine = this.getSOAPUrl(wsCollection, wsParams);
            fetch(wsRoutesPerLine).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(this.state.CONST_MAPPINGS.RESPONSE_NOT_OK);
            }).then((json) => {
                if (json.ListaRotasLinhaResult && json.ListaRotasLinhaResult.hasOwnProperty("WSRota")) {
                    routesList = json.ListaRotasLinhaResult.WSRota;
                    this.setState({
                        routesList: routesList,
                        selectedRouteId: (routesList.Id_Rota) ? routesList.Id_Rota : routesList[0].Id_Rota
                    });
                    return routesList;
                }
                throw new Error(this.state.CONST_MAPPINGS.RESPONSE_DATA_CHANGED);
            });
        }
        return routesList;
    }
    getReferencePointsPerRoute(routeId) {
        let referencePointsList = [];
        if (routeId) {
            this.setState({
                selectedRouteId: routeId,
                referencePointsList: referencePointsList
            });
            const wsCollection = this.state.CONST_MAPPINGS.COL_REFERENCE_POINTS;
            let wsParams = {"routeId": routeId};
            const wsReferencePoints = this.getSOAPUrl(wsCollection, wsParams);
            fetch(wsReferencePoints).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(this.state.CONST_MAPPINGS.RESPONSE_NOT_OK);
            }).then((json) => {
                if (json.ListaPontosReferenciaRotaResult && json.ListaPontosReferenciaRotaResult.hasOwnProperty("WSPontoReferencia")) {
                    referencePointsList = json.ListaPontosReferenciaRotaResult.WSPontoReferencia;
                    let centerReference = (referencePointsList.length > 4) ? Math.floor(referencePointsList.length/2) : 0;
                    this.setState({
                        referencePointsList: referencePointsList,
                        mapCenter: {lat: referencePointsList[centerReference].Latitude, lng: referencePointsList[centerReference].Longitude},
                        mapZoom: (referencePointsList.length > 10) ? this.state.defaultMapZoom - 2 : this.state.defaultMapZoom + 1
                    });
                    return referencePointsList;
                }
            });
        }
        return referencePointsList;
    }
    getVehiclesInRoute(lineId, routeId) {
        let vehiclesInRoute = [];
        if (this.state.intervalID > 0) {
            clearInterval(this.state.intervalID);
        }
        this.setState({
            vehiclesInRoute: vehiclesInRoute,
            intervalID: 0
        });
        if (lineId, routeId) {
            const wsCollection = this.state.CONST_MAPPINGS.COL_VEHICLES_ROUTE;
            let wsParams = {"linha": lineId, "routeId": routeId};
            const wsVehiclesInRoute = this.getSOAPUrl(wsCollection, wsParams);
            fetch(wsVehiclesInRoute).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(this.state.CONST_MAPPINGS.RESPONSE_NOT_OK);
            }).then((json) => {
                if (json.ListaVeiculosEmViagemResult && json.ListaVeiculosEmViagemResult.hasOwnProperty("WSVeiculosViagem")) {
                    if (json.ListaVeiculosEmViagemResult.WSVeiculosViagem.Veiculos.hasOwnProperty("WSVeiculo")) {
                        vehiclesInRoute = json.ListaVeiculosEmViagemResult.WSVeiculosViagem.Veiculos.WSVeiculo;
                        if (vehiclesInRoute.length > 0) {
                            let intervalID = setInterval(() => {
                                this.getVehiclesInRoute(this.state.selectedLineId, this.state.selectedRouteId);
                            }, 30000);
                            this.setState({
                                vehiclesInRoute: vehiclesInRoute,
                                intervalID: intervalID
                            });
                        }
                    }
                    return vehiclesInRoute;
                }
            });
        }
        return vehiclesInRoute;
    }
    getDefaultMapCenter() {
        return this.state.defaultMapCenter;
    }
    getDefaultMapZoom() {
        return this.state.defaultMapZoom;
    }
    getMapAccessKeys() {
        return this.state.mapAccessKey;
    }
}