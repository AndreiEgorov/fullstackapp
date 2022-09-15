import { Stack, StackProps } from "aws-cdk-lib";
import { SPADeploy } from "cdk-spa-deploy";
import { Construct } from "constructs";
import {
  ARecord,
  PublicHostedZone,
  RecordTarget,
} from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

export class SpaStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & { childZone: PublicHostedZone }
  ) {
    super(scope, id, props);

    const subdomain = "spa.fullstackapp.highbond-s3.com";

    // 2. get certificate. => create ACM certificate for CloudFront in us-east-1 and validate it using DNS
    const certificate = new DnsValidatedCertificate(this, "Certificate", {
      hostedZone: props.childZone,
      domainName: subdomain,
      subjectAlternativeNames: [`*.${subdomain}`],
      region: "us-east-1",
    });

    // 1. configure cloudfront
    const spa = new SPADeploy(this, "Spa").createSiteWithCloudfront({
      websiteFolder: "spa",
      indexDoc: "index.html",
      certificateARN: certificate.certificateArn,
      cfAliases: [subdomain, `*.${subdomain}`],
    });

    // 3 add route53 records (alias record) 
    // create for a root

    new ARecord(this, "Alias", {
      zone: props.childZone,
      recordName: subdomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(spa.distribution)),
    });

    // create entry for Wildcard *
    new ARecord(this, "WildcardAlias", {
      zone: props.childZone,
      recordName: `*.${subdomain}`,
      target: RecordTarget.fromAlias(new CloudFrontTarget(spa.distribution)),
    });
  }
}
