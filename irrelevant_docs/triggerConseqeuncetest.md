{
  "message": "Consequence processing complete",
  "processed": 6,
  "successful": 4,
  "failed": 2,
  "results": [
    {
      "success": true,
      "consequence_id": "d7742833-2694-4f32-8793-4a3d84770924",
      "triggered": false,
      "details": {
        "spared": true
      }
    },
    {
      "success": false,
      "triggered": true,
      "details": {
        "consequences": [
          {
            "type": "monetary",
            "success": false,
            "details": {
              "success": false,
              "error": "Insufficient funds: 0 < 25",
              "attempted_amount": 25,
              "available_balance": 0
            }
          }
        ]
      }
    },
    {
      "success": false,
      "triggered": true,
      "details": {
        "consequences": [
          {
            "type": "monetary",
            "success": false,
            "details": {
              "success": false,
              "error": "Insufficient funds: 0 < 25",
              "attempted_amount": 25,
              "available_balance": 0
            }
          }
        ]
      }
    },
    {
      "success": true,
      "consequence_id": "6f2efb20-ac38-4212-97cf-4c098f6b46a6",
      "triggered": false,
      "details": {
        "spared": true
      }
    },
    {
      "success": true,
      "consequence_id": "34cb5681-05dd-4611-85f2-96b21fb353bc",
      "triggered": false,
      "details": {
        "spared": true
      }
    },
    {
      "success": true,
      "consequence_id": "6a0fb559-d9e4-4b84-8f25-0865b82e7479",
      "triggered": false,
      "details": {
        "spared": true
      }
    }
  ]
}