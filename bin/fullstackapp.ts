#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { SpaStack } from "../lib/spa-stack";
import { DnsStack } from "../lib/dns-stack";

const app = new cdk.App();

const dnsStack = new DnsStack(app, "fullstackapp-dns-aegorov", {
  stackName: "fullstackdemo-dns-aegorov",
});

const spaStack = new SpaStack(app, "fullstackapp-spa-aegorov", {
  stackName: "fullstackapp-spa-aegorov",
  childZone: dnsStack.childZone,
});
