import { Stack, StackProps } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import {
  CrossAccountZoneDelegationRecord,
  PublicHostedZone,
} from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export class DnsStack extends Stack {
  public readonly childZone: PublicHostedZone;
  
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const childZone = new PublicHostedZone(this, "SubZone", {
      zoneName: "fullstackapp.highbond-s3.com",
    });

    this.childZone = childZone;

    const route53RoleARN = Stack.of(this).formatArn({
      region: "",
      service: "iam",
      account: "891067072053",
      resource: "role",
      resourceName: "CrossAccountRoute53",
    });

    const crossAccountRole = Role.fromRoleArn(
      this,
      "CrossAccountRole",
      route53RoleARN
    );

    // Create delegation from parent hosted zone to DNS sub-zone

    new CrossAccountZoneDelegationRecord(this, "delegate", {
      delegatedZone: childZone,
      parentHostedZoneName: "highbond-s3.com",
      delegationRole: crossAccountRole,
    });
  }
}
