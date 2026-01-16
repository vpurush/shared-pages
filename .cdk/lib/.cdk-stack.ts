import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  Certificate,
  ICertificate,
  ValidationMethod,
} from "aws-cdk-lib/aws-certificatemanager";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkStack extends cdk.Stack {
  private subDomainName = "shared.vpurush.com";

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nextJSAppBucket = new Bucket(this, "SharedVpurushNextJSAppBucket", {
      bucketName: "shared-vpurush-app",
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const assetBucket = new Bucket(this, "SharedVpurushAssetBucket", {
      bucketName: "shared-vpurush-assets",
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    // Create CloudFront distribution
    const distribution = new Distribution(
      this,
      "SharedVpurushAppDistribution",
      {
        domainNames: [this.subDomainName],
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessControl(nextJSAppBucket),
        },
        additionalBehaviors: {
          "/assets/*": {
            origin: S3BucketOrigin.withOriginAccessControl(assetBucket),            
          },
        },
        certificate: this.getCertificate(),
      }
    );

    // Output the distribution URL
    new cdk.CfnOutput(this, "DistributionURL", {
      value: `https://${distribution.distributionDomainName}`,
      description: "CloudFront Distribution URL",
    });
  }

  getCertificate() {
    return Certificate.fromCertificateArn(
      this,
      "SiteCertificate",
      "arn:aws:acm:us-east-1:175468255336:certificate/c2144381-82ed-44f9-9232-29416b8426d7"
    );
  }
}
