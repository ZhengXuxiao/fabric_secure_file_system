package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "strings"
    "github.com/hyperledger/fabric/core/chaincode/shim"
    sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {

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
    if function == "createFile" {
        return s.createFile(APIstub, args)
    } else if function == "queryFileByPartialKey" {
        return s.queryFileByPartialKey(APIstub, args)
    } else if function == "changeFileOwner" {
        return s.changeFileOwner(APIstub, args)
    }

    return shim.Error("Invalid Smart Contract function name.")
}


/*
 * createFile function: create a new file record by providing key values
 */
func (s *SmartContract) createFile(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

    if len(args) != 5 {
        return shim.Error("Incorrect number of arguments. Expecting name, hash, keyword, summary, owner")
    }
    // create an object
    var file = File{Name: args[0], Hash: args[1], Keyword: args[2], Summary: args[3], Owner: args[4]}
    fileAsBytes, _ := json.Marshal(file)

    // we need a relational database as an addition to leveldb
    // edit here when custom interface is ready
    // we currently use composite key with name, keyword and owner.
    keys := []string{args[0], args[2], args[4]}
    ckey, err := APIstub.CreateCompositeKey("File", keys)
    if err != nil {
        return shim.Error(err.Error())
    }
    APIstub.PutState(ckey, fileAsBytes)

    // set an event
    APIstub.SetEvent("createFile", fileAsBytes)
    return shim.Success(nil)
}


/*
 *queryFileByPartialKey function: query File by at least one at most three keys
 */
func (s *SmartContract) queryFileByPartialKey(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

    if len(args) < 1 {
        return shim.Error("Incorrect number of arguments. Expacting at least one key from name, keyword and owner to search file system")
    }

    // get query result
    resultsIterator, err := APIstub.GetStateByPartialCompositeKey("File", args)
    if err != nil {
        return shim.Error(err.Error())
    }
    defer resultsIterator.Close()

    // buffer is a JSON array containing query results
    var buffer bytes.Buffer
    buffer.WriteString("[")

    bArrayMemberAlreadyWritten := false
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return shim.Error(err.Error())
        }
        if bArrayMemberAlreadyWritten == true {
            buffer.WriteString(",")
        }
        buffer.WriteString("{\"Key\":{\"objectType\":")
        typeString, keys, err := APIstub.SplitCompositeKey(queryResponse.Key)
        if err != nil {
            return shim.Error(err.Error())
        }
        buffer.WriteString(typeString)
        buffer.WriteString("\", \"attributes\":[\"")
        buffer.WriteString(strings.Join(keys, "\", \""))
        buffer.WriteString("\"]}, \"Record\":")
        buffer.WriteString(string(queryResponse.Value))
        buffer.WriteString("}")
        bArrayMemberAlreadyWritten = true
    }
    buffer.WriteString("]")

    fmt.Printf("- queryFileByPartialKey:\n%s\n", buffer.String())
    return shim.Success(buffer.Bytes())
}


/*
 * changeFileOwner function: change owner of a file. must provide complete composite key
 */
func (s *SmartContract) changeFileOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
    if len(args) != 4 {
        return shim.Error("Incorrect number of arguments. Expecting 3 keys and 1 new owner")
    }

    // create composite key
    keys := []string{args[0], args[1], args[2]}
    ckey, err := APIstub.CreateCompositeKey("File", keys)
    if err != nil {
        return shim.Error(err.Error())
    }
    //query the File
    fileAsBytes, _ := APIstub.GetState(ckey)
    file := File{}
    json.Unmarshal(fileAsBytes, &file)
    // edit Owner attribute
    file.Owner = args[3]
    fileAsBytes, _ = json.Marshal(file)
    APIstub.PutState(ckey, fileAsBytes)

    return shim.Success(nil)
}

// for test
func main() {
    err := shim.Start(new(SmartContract))
    if err != nil {
        fmt.Printf("Error creating new Smart Contract: %s", err)
    }
}
