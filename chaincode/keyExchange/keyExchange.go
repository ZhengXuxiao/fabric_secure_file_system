package main

import (
    "bytes"
    "encoding/json"
    "encoding/pem"
    "fmt"
    "crypto/x509"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {

}

type Request struct {
    From string `json:"from"`
    To string `json:"To"`
    File string `json:"file"`
    RequestTime string `json:"requestTime"`
    ResponseTime string `json:"responseTime"`
    ConfirmationTime string `json:"confirmationTime"`
}

type RequestMessage struct {
    From string `json:"from"`
    To string `json:"To"`
    File string `json:"file"`
    TxID string `json:"tx_id"`
}

type ResponseMessage struct {
    From string `json:"from"`
    To string `json:"To"`
    File string `json:"file"`
    TxID string `json:"tx_id"`
    Secret string `json:"secret"`
}

type File struct {
    Name string `json:"name"`
    Hash string `json:"hash"`
    Keyword string `json:"keyword"`
    Summary string `json:"summary"`
    Owner string `json:"owner"`
}

/*
* Init function: necessary
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
    return shim.Success(nil)
}


/*
 * Invoke function: necessary
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

    function, args := APIstub.GetFunctionAndParameters()
    if function == "requestSecret" {
        return s.requestSecret(APIstub, args)
    } else if function == "respondSecret" {
        return s.respondSecret(APIstub, args)
    } else if function == "confirmSecret" {
        return s.confirmSecret(APIstub, args)
    }

    return shim.Error("Invalid Smart Contract function name.")
}


func (s *SmartContract) requestSecret(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

    if len(args) != 3 {
        return shim.Error("Incorrect number of arguments. Expecting 3 keys of file")
    }

    uname, err := s.testCertificate(APIstub, nil)
    if err != nil {
        return shim.Error(err.Error())
    }

    // produce the composite key for file
    keys := []string{args[0], args[1], args[2]}
    ckey, err := APIstub.CreateCompositeKey("File", keys)
    if err != nil {
        return shim.Error(err.Error())
    }

    // check the existence of the file
    argsByBytes := [][]byte{[]byte("queryFile"), []byte(args[0]), []byte(args[1]), []byte(args[2])}
    res := APIstub.InvokeChaincode("myapp", argsByBytes, "")
    if res.Status > 400 {
        return shim.Error("Fail to call file chaincode")
    }
    if len(res.Payload) <= 2 {
        return shim.Error("The file is not exist")
    }

    // get timestamp and tx_id
    tx_id := APIstub.GetTxID()
    timestamp, err := APIstub.GetTxTimestamp()
    if err != nil {
        return shim.Error(err.Error())
    }

    // put request record
    var request = Request{From: uname, To: args[2], File: ckey, RequestTime: timestamp.String(), ResponseTime: "", ConfirmationTime: ""}
    requestAsBytes, _ := json.Marshal(request)
    APIstub.PutState(tx_id, requestAsBytes)

    // broadcast an event
    var message = RequestMessage{From: uname, To: args[2], File: ckey, TxID: tx_id}
    messageAsBytes, _ := json.Marshal(message)
    APIstub.SetEvent("requestSecret", messageAsBytes)

    return shim.Success(nil)
}


func (s *SmartContract) respondSecret(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

    if len(args) != 2 {
        return shim.Error("Incorrect number of arguments. Expecting tx_id and secret")
    }

    uname, err := s.testCertificate(APIstub, nil)
    if err != nil {
        return shim.Error(err.Error())
    }

    // get the request record by tx_id
    requestAsBytes, err := APIstub.GetState(args[0])
    request := Request{}
    json.Unmarshal(requestAsBytes, &request)

    // check
    if uname != request.To {
        return shim.Error("Wrong transaction ID")
    }
    // add timestamp
    timestamp, err := APIstub.GetTxTimestamp()
    if err != nil {
        return shim.Error(err.Error())
    }
    if request.ResponseTime == "" {
        request.ResponseTime = timestamp.String()
    } else {
        return shim.Error("This request already has a response")
    }
    requestAsBytes, _ = json.Marshal(request)
    APIstub.PutState(args[0], requestAsBytes)

    // broadcast an event
    var message = ResponseMessage{From: uname, To: request.From, File: request.File, TxID: args[0], Secret: args[1]}
    messageAsBytes, _ := json.Marshal(message)
    APIstub.SetEvent("respondSecret", messageAsBytes)

    return shim.Success(nil)
}


func (s *SmartContract) confirmSecret(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

    if len(args) != 1 {
        return shim.Error("Incorrect number of arguments. Expecting only tx_id")
    }

    uname, err := s.testCertificate(APIstub, nil)
    if err != nil {
        return shim.Error(err.Error())
    }

    // get the request record by tx_id
    requestAsBytes, err := APIstub.GetState(args[0])
    request := Request{}
    json.Unmarshal(requestAsBytes, &request)

    // check
    if uname != request.From {
        return shim.Error("Wrong transaction ID")
    }
    // add timestamp
    timestamp, err := APIstub.GetTxTimestamp()
    if err != nil {
        return shim.Error(err.Error())
    }
    if request.ConfirmationTime == "" {
        request.ConfirmationTime = timestamp.String()
    } else {
        return shim.Error("This request has been confirmed")
    }
    requestAsBytes, _ = json.Marshal(request)
    APIstub.PutState(args[0], requestAsBytes)

    return shim.Success(nil)
}


func (s *SmartContract) testCertificate(stub shim.ChaincodeStubInterface, args []string ) (string, error) {
    creatorByte, _ := stub.GetCreator()
    certStart := bytes.IndexAny(creatorByte, "-----BEGIN")
    if certStart == -1 {
        return "", fmt.Errorf("%s", "no certificate detected")
    }

    certText := creatorByte[certStart:]
    content, _ := pem.Decode(certText)
    if content == nil {
        return "", fmt.Errorf("%s", "fail to decode the certificate")
    }

    cert, err := x509.ParseCertificate(content.Bytes)
    if err != nil {
        return "", fmt.Errorf("%s", "fail when parsing the x509 certificate")
    }
    cname := cert.Subject.CommonName
    return cname, nil
}


// for test
func main() {
    err := shim.Start(new(SmartContract))
    if err != nil {
        fmt.Printf("Error creating new Smart Contract: %s", err)
    }
}
