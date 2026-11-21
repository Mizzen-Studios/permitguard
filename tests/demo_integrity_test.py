import copy
import importlib.util
import pathlib
import unittest

spec = importlib.util.spec_from_file_location('integrity', pathlib.Path(__file__).parents[1]/'scripts/check-demo-integrity.py')
integrity = importlib.util.module_from_spec(spec)
spec.loader.exec_module(integrity)

class IntegrityTests(unittest.TestCase):
    def fixture(self):
        return {'key':'PGSAMPLE-2','fields':{'project':{'key':'PGSAMPLE'},'assignee':{'accountId':'owner'},'description':copy.deepcopy(integrity.EXPECTED_DESCRIPTION),'status':{'name':'To Do'}}}
    def test_restored_assignee_and_original_description(self):
        events = [{'created':'2026-11-21T08:04:06.212-0500','items':[{'field':'assignee','fromString':'Olly','toString':None}]}]
        result = integrity.summarize(self.fixture(), events, {'state':'ACTIVE','revision':6,'authoritative':False}, {'accountId':'owner'})
        self.assertTrue(result['assigneeMatchesAuthenticatedOwner'])
        self.assertTrue(result['descriptionMatchesProvisionedFixture'])
        self.assertEqual(result['descriptionChangeCount'],0)
        self.assertIn('13:04:06',result['changes'][0]['atUtc'])
        self.assertIsNone(result['siteRevision'])
        self.assertFalse(result['rawForgeCesRead'])
    def test_description_change_is_detected(self):
        issue = self.fixture();issue['fields']['description'] = None
        result = integrity.summarize(issue, [], {}, {'accountId':'owner'})
        self.assertFalse(result['descriptionMatchesProvisionedFixture'])
    def test_wrong_project_is_rejected(self):
        issue = self.fixture();issue['fields']['project']['key'] = 'REAL'
        with self.assertRaises(ValueError):
            integrity.summarize(issue, [], {}, {'accountId':'owner'})

if __name__ == '__main__':
    unittest.main()
