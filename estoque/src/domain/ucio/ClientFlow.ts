import { ErrorEntity } from "../association/error.js";
import { ClientFlowAssociation } from "../association/association.js";

class CreateClientFlowUseCaseRequest {
  public userId: string
  public productId: string
  public clientName: string
  public clientContact: string
  public description?: string

  constructor(userId: string, productId: string, clientName: string, clientContact: string, description?: string) {
    this.userId = userId
    this.productId = productId
    this.clientName = clientName
    this.clientContact = clientContact
    this.description = description
  }
}

class CreateClientFlowUseCaseResponse {
  public flow: ClientFlowAssociation | null
  public error: ErrorEntity | null

  constructor(flow: ClientFlowAssociation | null, error: ErrorEntity | null) {
    this.flow = flow
    this.error = error
  }
}

class ListClientFlowsUseCaseRequest {
  public userId: string

  constructor(userId: string) {
    this.userId = userId
  }
}

class ListClientFlowsUseCaseResponse {
  public flows: ClientFlowAssociation[]
  public error: ErrorEntity | null

  constructor(flows: ClientFlowAssociation[], error: ErrorEntity | null) {
    this.flows = flows
    this.error = error
  }
}

class TrackClientFlowUseCaseRequest {
  public trackingToken: string

  constructor(trackingToken: string) {
    this.trackingToken = trackingToken
  }
}

class TrackClientFlowUseCaseResponse {
  public success: boolean
  public error: ErrorEntity | null

  constructor(success: boolean, error: ErrorEntity | null) {
    this.success = success
    this.error = error
  }
}

class UpdateClientFlowStatusUseCaseRequest {
  public flowId: string
  public currentStatus: string
  public description?: string
  public nextFollowUpAt?: string

  constructor(flowId: string, currentStatus: string, description?: string, nextFollowUpAt?: string) {
    this.flowId = flowId
    this.currentStatus = currentStatus
    this.description = description
    this.nextFollowUpAt = nextFollowUpAt
  }
}

class UpdateClientFlowStatusUseCaseResponse {
  public flow: ClientFlowAssociation | null
  public error: ErrorEntity | null

  constructor(flow: ClientFlowAssociation | null, error: ErrorEntity | null) {
    this.flow = flow
    this.error = error
  }
}

export {
  CreateClientFlowUseCaseRequest, CreateClientFlowUseCaseResponse,
  ListClientFlowsUseCaseRequest, ListClientFlowsUseCaseResponse,
  TrackClientFlowUseCaseRequest, TrackClientFlowUseCaseResponse,
  UpdateClientFlowStatusUseCaseRequest, UpdateClientFlowStatusUseCaseResponse,
}
